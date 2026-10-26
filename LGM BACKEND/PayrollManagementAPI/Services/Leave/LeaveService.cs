using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.Attendance;
using PayrollManagementAPI.DTO.LeaveDetails;
using CompanyPlatform.Core.Hubs;
using CompanyPlatform.Core.Models;
using PayrollManagementAPI.Services.Attendance;
using PayrollManagementAPI.Services.Leave;
using PayrollManagementAPI.Services.Notification;
using CompanyPlatform.Core.Services.Notification;

namespace PayrollManagementAPI.Services
{
    public class LeaveService : ILeaveService
    {
        private readonly ApplicationDBContext _context;
        private readonly IAttendanceService _attendanceService;
        private readonly IHubContext<NotificationHub> _hubContext; 
        private readonly IUserConnectionService _userConnectionService;
        private readonly INotificationService _notificationService;

        public LeaveService(ApplicationDBContext context, ILogger<LeaveService> logger, IAttendanceService attendanceService, IHubContext<NotificationHub> hubContext, IUserConnectionService userConnectionService, INotificationService notificationService)
        {
            _context = context;
            _attendanceService = attendanceService;
            _hubContext = hubContext; 
            _userConnectionService = userConnectionService;
            _notificationService = notificationService;
        }

        //private int GetFinancialYearForDate(DateTime date) => date.Month >= 4 ? date.Year : date.Year - 1;
        private int GetFinancialYearForDate(DateTime date) => date.Year;

        private decimal CalculateLeaveDuration(DateTime fromDate, DateTime toDate)
        {
            var datesInPeriod = new List<DateTime>();
            for (var date = fromDate.Date; date <= toDate.Date; date = date.AddDays(1))
            {
                datesInPeriod.Add(date);
            }

            bool isSandwich = false;
            var saturdaysInPeriod = datesInPeriod.Where(d => d.DayOfWeek == DayOfWeek.Saturday);
            foreach (var saturday in saturdaysInPeriod)
            {
                var followingMonday = saturday.AddDays(2);
                if (datesInPeriod.Contains(followingMonday))
                {
                    isSandwich = true;
                    break; 
                }
            }

            if (isSandwich)
            {
                return (decimal)datesInPeriod.Count;
            }
            else
            {
                decimal deductibleDays = datesInPeriod.Count(d => d.DayOfWeek != DayOfWeek.Sunday);
                return deductibleDays;
            }
        }

        public async Task<LeaveRequest> ApplyForLeaveAsync(LeaveRequestCreateDto dto)
        {
            var employee = await _context.Employees.FindAsync(dto.EmployeeID);
            if (employee?.DateOfJoining == null) throw new Exception("Employee not found or Date of Joining is not set.");

            // 1. Service Eligibility Check
            //if (DateTime.UtcNow < employee.DateOfJoining.Value.AddMonths(6))
            //    throw new Exception("You are not eligible for leave until you complete 6 months of service.");

            // 2. Year Boundary Restriction
            if (dto.FromDate.Year != dto.ToDate.Year)
                throw new Exception("Leave requests cannot span across two different years. Please submit two separate requests.");

            var leaveType = await _context.Tb_LeaveTypes.FindAsync(dto.LeaveTypeID);
            if (leaveType == null) throw new Exception("Leave Type not found.");

            // 3. Determine Leave Duration (Handle Half-Day Logic)
            decimal leaveDays = dto.IsHalfDay ? 0.5m : CalculateLeaveDuration(dto.FromDate, dto.ToDate);
            if (leaveDays <= 0) throw new Exception("Leave cannot be applied for 0 or fewer working days.");

            // 4. Balance Validation (Read-only check)
            var financialYear = GetFinancialYearForDate(dto.FromDate);
            var balances = await GetLeaveBalanceAsync(dto.EmployeeID, financialYear);
            var specificBalance = balances.FirstOrDefault(b => b.LeaveTypeName == leaveType.LeaveTypeName);

            if (specificBalance == null || specificBalance.BalanceDays < leaveDays)
            {
                throw new Exception($"Insufficient leave balance for {leaveType.LeaveTypeName}. Required: {leaveDays}, Available: {specificBalance?.BalanceDays ?? 0}");
            }

            // 5. Save the Request as "Pending" (Do NOT update Ledger yet)
            var leaveRequest = new LeaveRequest
            {
                EmployeeID = dto.EmployeeID,
                LeaveTypeID = dto.LeaveTypeID,
                FromDate = dto.FromDate,
                ToDate = dto.IsHalfDay ? dto.FromDate : dto.ToDate,
                Days = leaveDays,
                Reason = dto.IsHalfDay ? $"[Half Day - {dto.HalfDayPeriod}] {dto.Reason}" : dto.Reason,
                Status = "Pending",
                AppliedDate = DateTime.UtcNow,
                IsHalfDay = dto.IsHalfDay, // Assuming these properties exist in your model
                HalfDayPeriod = dto.HalfDayPeriod
            };

            _context.Tb_LeaveRequests.Add(leaveRequest);
            await _context.SaveChangesAsync();

            // 6. Notifications
            if (employee.ReportingTo.HasValue)
            {
                var managerId = employee.ReportingTo.Value;
                var message = $"{employee.FirstName} {employee.LastName} has submitted a {(dto.IsHalfDay ? "Half-Day " : "")}leave request for your approval.";
                await _notificationService.CreateNotificationAsync(managerId, message);

                var managerConnectionId = _userConnectionService.GetUserConnection(managerId);
                if (!string.IsNullOrEmpty(managerConnectionId))
                {
                    await _hubContext.Clients.Client(managerConnectionId).SendAsync("ReceiveNotification", message);
                }
            }

            return leaveRequest;
        }

        public async Task<List<LeaveBalanceDto>> GetLeaveBalanceAsync(int employeeId, int financialYear)
        {
            var allLeaveTypes = await _context.Tb_LeaveTypes.Where(lt => !lt.IsDeleted).ToListAsync();
            var balanceList = new List<LeaveBalanceDto>();

            // Boundaries: January 1st to December 31st
            var yearStartDate = new DateTime(financialYear, 1, 1);
            var yearEndDate = new DateTime(financialYear, 12, 31);

            // 1. Allocated Leaves (Assigned by Admin for the specific year)
            var assignedLeavesDict = await _context.Tb_AssignLeaveTypes
                .Where(al => al.EmployeeID == employeeId && al.FinancialYear == financialYear && !al.IsDeleted)
                .ToDictionaryAsync(al => al.LeaveTypeID, al => al.AllocatedDays);

            // 2. Earned Leaves / C-Offs (Strictly earned within the requested year)
            var earnedLeavesDict = await _context.Tb_LeaveCreditLedgers
                .Where(l => l.EmployeeID == employeeId &&
                            l.EarnedDate.Year == financialYear && // Filter by target year
                            l.ExpiryDate >= DateTime.UtcNow &&
                            l.LeaveRequestID == null)
                .GroupBy(l => l.LeaveTypeID)
                .Select(g => new { LeaveTypeId = g.Key, Balance = g.Sum(l => l.Credit) })
                .ToDictionaryAsync(g => g.LeaveTypeId, g => g.Balance);

            // 3. Availed Leaves (Approved requests within the requested year boundaries)
            var availedLeavesDict = await _context.Tb_LeaveRequests
                .Where(lr => lr.EmployeeID == employeeId &&
                             lr.Status == "Approved" &&
                             !lr.IsDeleted &&
                             lr.FromDate >= yearStartDate &&
                             lr.ToDate <= yearEndDate)
                .GroupBy(lr => lr.LeaveTypeID)
                .Select(g => new { LeaveTypeId = g.Key, TotalDays = g.Sum(l => l.Days) })
                .ToDictionaryAsync(g => g.LeaveTypeId, g => g.TotalDays);

            foreach (var lt in allLeaveTypes)
            {
                decimal assigned = assignedLeavesDict.GetValueOrDefault(lt.ID, 0);
                decimal earned = earnedLeavesDict.GetValueOrDefault(lt.ID, 0);
                decimal availed = availedLeavesDict.GetValueOrDefault(lt.ID, 0);

                var totalAllocation = assigned + earned;

                balanceList.Add(new LeaveBalanceDto
                {
                    LeaveTypeName = lt.LeaveTypeName,
                    AllocatedDays = totalAllocation,
                    AvailedDays = availed,
                    BalanceDays = Math.Max(0, totalAllocation - availed)
                });
            }
            return balanceList;
        }

        public async Task<List<LeaveRequestViewDto>> GetLeaveHistoryAsync(int employeeId)
        {
                return await _context.Tb_LeaveRequests
            .Where(lr => lr.EmployeeID == employeeId && !lr.IsDeleted)
            .Include(lr => lr.LeaveType)
            .OrderByDescending(lr => lr.FromDate)
            .Select(lr => new LeaveRequestViewDto
            {
                Id = lr.ID,
                LeaveTypeName = lr.LeaveType.LeaveTypeName,
                FromDate = lr.FromDate.ToString("dd-MMM-yyyy"),
                ToDate = lr.ToDate.ToString("dd-MMM-yyyy"),
                Days = lr.Days, 
                Reason = lr.Reason,
                Status = lr.Status,
                AppliedDate = lr.AppliedDate
            })
            .ToListAsync();
        }

        public async Task<List<LeaveRequestViewDto>> GetPendingApprovalsAsync(int managerId)
        {
            return await _context.Tb_LeaveRequests
                .Where(lr => lr.Employee.ReportingTo == managerId && lr.Status == "Pending" && !lr.IsDeleted)
                .Include(lr => lr.Employee)
                .Include(lr => lr.LeaveType)
                .Select(lr => new LeaveRequestViewDto
                {
                    Id = lr.ID,
                    EmployeeId = lr.EmployeeID,
                    EmployeeName = lr.Employee.FirstName + " " + lr.Employee.LastName,
                    LeaveTypeName = lr.LeaveType.LeaveTypeName,
                    FromDate = lr.FromDate.ToString("dd-MMM-yyyy"),
                    ToDate = lr.ToDate.ToString("dd-MMM-yyyy"),
                    Days = lr.Days,
                    Reason = lr.Reason,
                    Status = lr.Status,
                    AppliedDate = lr.AppliedDate

                })
                .ToListAsync();
        }

        public async Task<List<LeaveRequestViewDto>> GetFilteredTeamLeaveHistoryAsync(int requesterId, bool isAdmin, string role)
        {
            var targetStatuses = new[] { "Approved", "Rejected" };

            // 1. Get requester info to find their department (for HR)
            var requester = await _context.Employees.FindAsync(requesterId);
            if (requester == null) return new List<LeaveRequestViewDto>();

            var query = _context.Tb_LeaveRequests
                .Where(lr => targetStatuses.Contains(lr.Status) && !lr.IsDeleted)
                .Include(lr => lr.Employee)
                .Include(lr => lr.LeaveType)
                .AsQueryable();

            // --- APPLY ROLE-BASED FILTERING ---
            if (isAdmin)
            {
                // Admin: Show All (No further filtering)
            }
            else if (role == "HR")
            {
                // HR: Show only their Department
                query = query.Where(lr => lr.Employee.DepartmentID == requester.DepartmentID);
            }
            else
            {
                // Manager/Others: Show only Direct Reports
                query = query.Where(lr => lr.Employee.ReportingTo == requesterId);
            }

            return await query
                .OrderByDescending(lr => lr.FromDate)
                .Select(lr => new LeaveRequestViewDto
                {
                    Id = lr.ID,
                    EmployeeId = lr.EmployeeID,
                    EmployeeName = lr.Employee.FirstName + " " + lr.Employee.LastName,
                    LeaveTypeName = lr.LeaveType.LeaveTypeName,
                    FromDate = lr.FromDate.ToString("dd-MMM-yyyy"),
                    ToDate = lr.ToDate.ToString("dd-MMM-yyyy"),
                    Days = lr.Days,
                    Reason = lr.Reason,
                    Status = lr.Status,
                    AppliedDate = lr.AppliedDate
                })
                .ToListAsync();
        }

        public async Task<LeaveRequest> UpdateLeaveStatusAsync(int leaveRequestId, string status, int approvedByEmployeeId)
        {
            var leaveRequest = await _context.Tb_LeaveRequests
                .Include(lr => lr.LeaveType)
                .Include(lr => lr.Employee)
                .FirstOrDefaultAsync(lr => lr.ID == leaveRequestId);

            if (leaveRequest == null) return null;

            var oldStatus = leaveRequest.Status;

            if (oldStatus == status) return leaveRequest;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                leaveRequest.Status = status;
                leaveRequest.ApprovedByEmployeeID = approvedByEmployeeId;

                if (status == "Approved")
                {
                    for (var date = leaveRequest.FromDate.Date; date <= leaveRequest.ToDate.Date; date = date.AddDays(1))
                    {
                        await _attendanceService.AddManualAttendanceAsync(new CreateAttendanceDto
                        {
                            EmployeeId = leaveRequest.EmployeeID,
                            Date = date,
                            Status = leaveRequest.IsHalfDay ? AttendanceStatus.HalfDay : AttendanceStatus.OnLeave,
                            Notes = $"Approved Leave: {leaveRequest.LeaveType.LeaveTypeName}"
                        });
                    }

                    if (leaveRequest.LeaveType.LeaveTypeName.ToLower() == "c-off" ||
                        leaveRequest.LeaveType.LeaveTypeName.ToLower() == "earn leave")
                    {
                        var financialYear = leaveRequest.FromDate.Year;
                        var creditsToConsume = await _context.Tb_LeaveCreditLedgers
                            .Where(l => l.EmployeeID == leaveRequest.EmployeeID &&
                                        l.LeaveTypeID == leaveRequest.LeaveTypeID &&
                                        l.ExpiryDate >= DateTime.UtcNow &&
                                        l.LeaveRequestID == null &&
                                        l.EarnedDate.Year == financialYear)
                            .OrderBy(l => l.ExpiryDate)
                            .ToListAsync();

                        decimal daysToCover = leaveRequest.Days;
                        foreach (var credit in creditsToConsume)
                        {
                            if (daysToCover <= 0) break;
                            decimal creditToUse = Math.Min(daysToCover, credit.Credit);

                            credit.LeaveRequestID = leaveRequest.ID;
                            _context.Tb_LeaveCreditLedgers.Update(credit);
                            daysToCover -= creditToUse;
                        }

                        if (daysToCover > 0.01m)
                        {
                            throw new Exception("Cannot approve. The employee no longer has sufficient credit balance in the ledger.");
                        }
                    }
                }
                else if (oldStatus == "Approved" && (status == "Rejected" || status == "Cancelled"))
                {
                    for (var date = leaveRequest.FromDate.Date; date <= leaveRequest.ToDate.Date; date = date.AddDays(1))
                    {
                        var attendanceRecord = await _context.Tbl_Attendance
                            .FirstOrDefaultAsync(a => a.EmployeeID == leaveRequest.EmployeeID && a.Date.Date == date.Date);

                        if (attendanceRecord != null)
                        {
                            attendanceRecord.Status = AttendanceStatus.Absent;
                            attendanceRecord.Notes = "Approved Leave was later Rejected/Cancelled";
                        }
                    }

                    var consumedCredits = await _context.Tb_LeaveCreditLedgers
                        .Where(l => l.LeaveRequestID == leaveRequestId)
                        .ToListAsync();

                    foreach (var credit in consumedCredits)
                    {
                        credit.LeaveRequestID = null;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // 3. Notifications
                var approver = await _context.Employees.FindAsync(approvedByEmployeeId);
                var approverName = approver != null ? $"{approver.FirstName} {approver.LastName}" : "Your manager";
                var message = $"Your leave request from {leaveRequest.FromDate:dd-MMM} to {leaveRequest.ToDate:dd-MMM} has been {status} by {approverName}.";

                await _notificationService.CreateNotificationAsync(leaveRequest.EmployeeID, message);

                var employeeConnectionId = _userConnectionService.GetUserConnection(leaveRequest.EmployeeID);
                if (!string.IsNullOrEmpty(employeeConnectionId))
                {
                    await _hubContext.Clients.Client(employeeConnectionId).SendAsync("ReceiveNotification", message);
                }

                return leaveRequest;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<EmployeeLeaveBalanceReportDto>> GetAllEmployeesLeaveBalancesAsync(int financialYear, int requesterId, bool isAdmin)
        {
            var yearStartDate = new DateTime(financialYear, 1, 1);
            var yearEndDate = new DateTime(financialYear, 12, 31);

            var requester = await _context.Employees.FindAsync(requesterId);
            if (requester == null) return new List<EmployeeLeaveBalanceReportDto>();

            var query = _context.Employees
                .Where(e => e.IsActive && !e.IsDeleted)
                .Include(e => e.Department)
                .AsQueryable();

            if (!isAdmin)
            {
                query = query.Where(e => e.DepartmentID == requester.DepartmentID);
            }

            var employees = await query.ToListAsync();
            var allLeaveTypes = await _context.Tb_LeaveTypes.Where(lt => !lt.IsDeleted).ToListAsync();
            var employeeIds = employees.Select(e => e.ID).ToList();

            var allAssigned = await _context.Tb_AssignLeaveTypes
                .Where(al => employeeIds.Contains(al.EmployeeID) && al.FinancialYear == financialYear && !al.IsDeleted)
                .ToListAsync();

            var allEarned = await _context.Tb_LeaveCreditLedgers
                .Where(l => employeeIds.Contains(l.EmployeeID) && l.EarnedDate.Year == financialYear && l.LeaveRequestID == null)
                .ToListAsync();

            var allAvailed = await _context.Tb_LeaveRequests
                .Where(lr => employeeIds.Contains(lr.EmployeeID) && lr.Status == "Approved" && !lr.IsDeleted && lr.FromDate >= yearStartDate && lr.ToDate <= yearEndDate)
                .ToListAsync();

            var report = new List<EmployeeLeaveBalanceReportDto>();

            foreach (var emp in employees)
            {
                var empBalances = new List<LeaveBalanceDto>();

                foreach (var lt in allLeaveTypes)
                {
                    decimal assigned = allAssigned.Where(a => a.EmployeeID == emp.ID && a.LeaveTypeID == lt.ID).Sum(a => a.AllocatedDays);
                    decimal earned = allEarned.Where(e => e.EmployeeID == emp.ID && e.LeaveTypeID == lt.ID).Sum(e => e.Credit);
                    decimal availed = allAvailed.Where(v => v.EmployeeID == emp.ID && v.LeaveTypeID == lt.ID).Sum(v => v.Days);

                    decimal totalAllocated = assigned + earned;

                    empBalances.Add(new LeaveBalanceDto
                    {
                        LeaveTypeName = lt.LeaveTypeName,
                        AllocatedDays = totalAllocated,
                        AvailedDays = availed,
                        BalanceDays = totalAllocated - availed
                    });
                }

                report.Add(new EmployeeLeaveBalanceReportDto
                {
                    EmployeeID = emp.ID,
                    EmployeeCode = emp.EmployeeCode,
                    EmployeeName = $"{emp.FirstName} {emp.LastName}",
                    Department = emp.Department?.DepartmentName ?? "N/A",
                    Balances = empBalances
                });
            }

            return report;
        }

    }
}