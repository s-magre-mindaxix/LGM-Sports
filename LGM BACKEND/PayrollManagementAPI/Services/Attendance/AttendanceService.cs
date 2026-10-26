using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.Attendance;
using CompanyPlatform.Core.Models;

using CompanyPlatform.Core.Repository;
using CompanyPlatform.Core.Services.Notification;
using System.Security.Claims;
using AttendanceModel = CompanyPlatform.Core.Models.Attendance;
using CompanyPlatform.Core.Models.CRM.Employee;



namespace PayrollManagementAPI.Services.Attendance
{
    public class AttendanceService : IAttendanceService
    {
        private readonly ApplicationDBContext _context;
        private readonly IRepositories<CompanyPlatform.Core.Models.Attendance> _attendanceRepository;
        private readonly ILogger<AttendanceService> _logger;
        private readonly INotificationHelper _notificationHelper;
        private readonly DayOfWeek WeeklyOffDay = DayOfWeek.Sunday;

        public AttendanceService(ApplicationDBContext context, IRepositories<CompanyPlatform.Core.Models.Attendance> attendanceRepository, ILogger<AttendanceService> logger, INotificationHelper notificationHelper)
        {
            _context = context;
            _attendanceRepository = attendanceRepository;
            _logger = logger;
            _notificationHelper = notificationHelper;
        }

        public async Task ProcessBiometricPunchAsync(string biometricId, DateTime punchTime, string deviceId)
        {
            _logger.LogInformation("Processing punch from BiometricID: {BiometricID} at {PunchTime} from Device: {DeviceID}", biometricId, punchTime, deviceId);

            string cleanedId = biometricId.TrimStart('0');
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == cleanedId && e.IsActive);

            if (employee == null) return;

            var punchDate = punchTime.Date;
            var existingRecord = await _context.Tbl_Attendance
                                               .FirstOrDefaultAsync(a => a.EmployeeID == employee.ID && a.Date == punchDate);

            var createDto = new CreateAttendanceDto
            {
                EmployeeId = employee.ID,
                Date = punchDate,
            };

            if (existingRecord == null)
            {
                createDto.InTime = punchTime;
                createDto.OutTime = null;
                createDto.InDeviceID = deviceId;  
                createDto.OutDeviceID = null;
                createDto.Notes = $"In from Device: {deviceId}";
            }
            else
            {
                createDto.InTime = existingRecord.InTime;
                createDto.InDeviceID = existingRecord.InDeviceID;
                createDto.OutTime = punchTime;
                createDto.OutDeviceID = deviceId;
                createDto.Notes = existingRecord.Notes + $" | Out from Device: {deviceId}";
            }

            await AddManualAttendanceAsync(createDto);

            _logger.LogInformation("Successfully processed punch for Employee: {EmployeeName}", $"{employee.FirstName} {employee.LastName}");
        }

        public async Task<AttendanceRecordDto> AddManualAttendanceAsync(CreateAttendanceDto createDto)
        {
            _logger.LogInformation("Attempting to add/update manual attendance for EmployeeId: {EmployeeId}", createDto.EmployeeId);
            string halfDayReason = null;

            var calculatedStatus = createDto.Status;

            // Logic to calculate status based on time (Late marks, etc.)
            if (createDto.InTime.HasValue)
            {
                var date = createDto.Date.Date;
                var gracePeriodEndTime = date.AddHours(9).AddMinutes(11);
                var directHalfDayCutoffTime = date.AddHours(9).AddMinutes(21);
                var halfDayCutoffTime = date.AddHours(10);
                var punchInTime = createDto.InTime.Value;

                if (punchInTime > halfDayCutoffTime)
                {
                    calculatedStatus = AttendanceStatus.HalfDay;
                    halfDayReason = "arriving after the half-day cut-off time";
                }
                else if (punchInTime > directHalfDayCutoffTime) // NEW: Check for the 9:21 AM rule
                {
                    calculatedStatus = AttendanceStatus.HalfDay;
                    halfDayReason = "arriving after the 9:21 AM cut-off time";
                }
                else if (punchInTime >= gracePeriodEndTime)
                {
                    // Only check for the 3rd late mark if they haven't already hit the 10 AM cutoff
                    bool isThirdLateInMonth = await CheckForThirdLateInMonth(createDto.EmployeeId, date);

                    if (isThirdLateInMonth)
                    {
                        calculatedStatus = AttendanceStatus.HalfDay;
                        halfDayReason = "3rd late mark in this month";
                    }
                    else
                    {
                        calculatedStatus = AttendanceStatus.Present; // This counts as a late mark for next time
                    }
                }
               
                else
                {
                    calculatedStatus = AttendanceStatus.Present;
                }
            }

            CompanyPlatform.Core.Models.Attendance savedAttendance;
            var existingRecord = await _context.Tbl_Attendance.FirstOrDefaultAsync(a => a.EmployeeID == createDto.EmployeeId && a.Date.Date == createDto.Date.Date);

            if (existingRecord != null)
            {
                existingRecord.InTime = createDto.InTime ?? existingRecord.InTime;
                existingRecord.OutTime = createDto.OutTime;
                existingRecord.InDeviceID = createDto.InDeviceID ?? existingRecord.InDeviceID;
                existingRecord.OutDeviceID = createDto.OutDeviceID;
                existingRecord.Status = calculatedStatus; // Save physical status (Present/HalfDay) to DB
                existingRecord.Notes = createDto.Notes;
                await _attendanceRepository.Update(existingRecord);
                savedAttendance = existingRecord;
            }
            else
            {
                var attendance = new CompanyPlatform.Core.Models.Attendance
                {
                    EmployeeID = createDto.EmployeeId,
                    Date = createDto.Date.Date,
                    InTime = createDto.InTime,
                    OutTime = createDto.OutTime,
                    InDeviceID = createDto.InDeviceID,
                    OutDeviceID = createDto.OutDeviceID,
                    Status = calculatedStatus,
                    Notes = createDto.Notes
                };
                await _attendanceRepository.Create(attendance);
                savedAttendance = attendance;
            }

            if (halfDayReason != null)
            {
                await _notificationHelper.SendManagerNotificationAsync(
                    createDto.EmployeeId,
                    $"attendance being marked as a Half-Day for {createDto.Date:dd-MMM-yyyy} due to {halfDayReason}"
                );
            }

            await ProcessAttendanceForLeaveCredits(savedAttendance);

            // Fetch DTO and check for Outdoor Duty to ensure return object has correct status
            return await GetMappedRecordByIdAsync(savedAttendance.Id);
        }

        //private async Task ProcessAttendanceForLeaveCredits(Model.Attendance attendance)
        private async Task ProcessAttendanceForLeaveCredits(AttendanceModel attendance)

        {
            var existingCreditsForThisRecord = await _context.Tb_LeaveCreditLedgers
                .Where(l => l.AttendanceID == attendance.Id)
                .ToListAsync();

            if (existingCreditsForThisRecord.Any())
            {
                _context.Tb_LeaveCreditLedgers.RemoveRange(existingCreditsForThisRecord);
                await _context.SaveChangesAsync();
            }

            var compOffType = await _context.Tb_LeaveTypes
                .FirstOrDefaultAsync(lt => lt.LeaveTypeName.Trim().ToLower() == "c-off");

            if (compOffType == null)
            {
                _logger.LogError("Leave Type 'C-Off' not found.");
                return;
            }

            decimal potentialCredit = 0;
            string reason = "";

            if (attendance.Date.DayOfWeek == DayOfWeek.Sunday)
            {
                potentialCredit = 1.0m;
                reason = "Worked on Sunday";
            }
            else if (attendance.InTime.HasValue && attendance.OutTime.HasValue)
            {
                var shiftEndTime = attendance.Date.Date.AddHours(18);

                if (attendance.OutTime.Value > shiftEndTime)
                {
                    var overtimeDuration = attendance.OutTime.Value - shiftEndTime;
                    if (overtimeDuration >= new TimeSpan(6, 29, 0))
                    {
                        potentialCredit = 1.0m;
                        reason = "Overtime until midnight";
                    }
                    else if (overtimeDuration >= new TimeSpan(2, 30, 0))
                    {
                        potentialCredit = 0.5m;
                        reason = "Overtime until 8 PM";
                    }
                }
            }

            if (potentialCredit > 0)
            {
                var startOfMonth = new DateTime(attendance.Date.Year, attendance.Date.Month, 1);
                var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

                var creditsEarnedThisMonth = await _context.Tb_LeaveCreditLedgers
                    .Where(l => l.EmployeeID == attendance.EmployeeID &&
                                l.LeaveTypeID == compOffType.ID &&
                                l.EarnedDate >= startOfMonth &&
                                l.EarnedDate <= endOfMonth &&
                                l.AttendanceID != attendance.Id) // Exclude current record
                    .SumAsync(l => l.Credit);

                if (creditsEarnedThisMonth >= 2.0m)
                {
                    _logger.LogInformation("Employee {EmpID} reached monthly C-Off cap (2.0). Credit skipped for {Date}.", attendance.EmployeeID, attendance.Date.ToShortDateString());
                    return;
                }

                if (creditsEarnedThisMonth + potentialCredit > 2.0m)
                {
                    potentialCredit = 2.0m - creditsEarnedThisMonth;
                    reason += " (Capped at 2.0 per month)";
                }

                await CreateLeaveCreditAsync(attendance, compOffType.ID, potentialCredit, reason);
            }
        }

        private async Task CreateLeaveCreditAsync(AttendanceModel attendance, int leaveTypeId, decimal creditAmount, string notes)
        {
            DateTime threeMonthsExpiry = attendance.Date.AddMonths(3);

            DateTime endOfYear = new DateTime(attendance.Date.Year, 12, 31);

            DateTime finalExpiry = threeMonthsExpiry < endOfYear ? threeMonthsExpiry : endOfYear;

            var credit = new LeaveCreditLedger
            {
                EmployeeID = attendance.EmployeeID,
                LeaveTypeID = leaveTypeId,
                Credit = creditAmount,
                EarnedDate = attendance.Date,
                ExpiryDate = finalExpiry,
                Notes = notes,
                AttendanceID = attendance.Id
            };

            await _context.Tb_LeaveCreditLedgers.AddAsync(credit);
            await _context.SaveChangesAsync();

            _logger.LogInformation("C-Off Created: {Amount} days. Earned: {Earned:dd-MMM}. Expires: {Expiry:dd-MMM-yyyy}",
                creditAmount, attendance.Date, finalExpiry);
        }

        private async Task<bool> CheckForThirdLateInMonth(int employeeId, DateTime currentDate)
        {
            var gracePeriodEndTime = new TimeSpan(9, 11, 0);
            var directHalfDayCutoffTime = new TimeSpan(9, 21, 1);

            var startOfMonth = new DateTime(currentDate.Year, currentDate.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

            var lateCount = await _context.Tbl_Attendance
                .Where(a => a.EmployeeID == employeeId
                            && a.Date >= startOfMonth
                            && a.Date < currentDate
                            && a.InTime.HasValue
                            && a.InTime.Value.TimeOfDay >= gracePeriodEndTime
                            && a.InTime.Value.TimeOfDay < directHalfDayCutoffTime

                            && !a.IsDeleted)
                .CountAsync();

            // If they have 2 existing lates in the window, this current one (the 3rd) triggers the penalty.
            return (lateCount + 1) % 3 == 0;
        }

        public async Task<IEnumerable<AttendanceRecordDto>> GetAttendanceByDateAsync(DateTime date, ClaimsPrincipal user)
        {
            _ = int.TryParse(user.FindFirstValue("EmployeeId"), out var currentEmployeeId);
            var currentUserRole = user.FindFirstValue(ClaimTypes.Role);
            _ = int.TryParse(user.FindFirstValue("DepartmentID"), out var currentUserDeptId);

            _logger.LogInformation(
                "Fetching attendance for date {Date} for UserID: {UserId}, Role: {UserRole}, DepartmentID: {UserDeptId}",
                date.ToShortDateString(), currentEmployeeId, currentUserRole, currentUserDeptId);

            //start of fix
            if (date.DayOfWeek == WeeklyOffDay)
            {
                _logger.LogInformation("Date {Date} is a Weekly Off. Returning this status as priority.", date.ToShortDateString());

                IQueryable<Employees> employeeQuery = _context.Employees
                     .Where(e => e.IsActive && !e.IsDeleted)
                    .Include(e => e.Department)
                    .Include(e => e.WorkLocation);

                if (currentUserRole == "HR")
                {
                    employeeQuery = employeeQuery.Where(e => e.DepartmentID == currentUserDeptId);
                }
                else if (currentUserRole != "Admin" || currentUserRole == "Account")
                {
                    employeeQuery = employeeQuery.Where(e => e.ID == currentEmployeeId);
                }

                var employeesForWeeklyOff = await employeeQuery.ToListAsync();

                return employeesForWeeklyOff.Select(e => new AttendanceRecordDto
                {
                    EmployeeName = $"{e.FirstName} {e.LastName}",
                    EmployeeId = e.EmployeeCode,
                    Department = e.Department?.DepartmentName ?? "N/A",
                    Plant = e.WorkLocation?.LocationName ?? "N/A",
                    Status = "Weekly Off",
                    Overtime = "0:00"
                }).ToList();
            }


            var holiday = await _context.Tbl_Holidays
           .AsNoTracking()
           .FirstOrDefaultAsync(h => h.Date.Date == date.Date && !h.IsDeleted);

            if (holiday != null)
            {
                _logger.LogInformation("Date {Date} is a holiday: {HolidayDescription}. Returning holiday status for all employees.", date.ToShortDateString(), holiday.Description);

                // This logic is similar to the "Weekly Off" handling.
                IQueryable<Employees> employeeQuery = _context.Employees
                     .Where(e => e.IsActive && !e.IsDeleted)
                    .Include(e => e.Department)
                    .Include(e => e.WorkLocation);

                // Apply role-based filtering
                if (currentUserRole == "HR")
                {
                    employeeQuery = employeeQuery.Where(e => e.DepartmentID == currentUserDeptId);
                }
                else if (currentUserRole != "Admin" || currentUserRole == "Account")
                {
                    employeeQuery = employeeQuery.Where(e => e.ID == currentEmployeeId);
                }

                var employees = await employeeQuery.ToListAsync();

                // Return a list where every employee has the "Holiday" status.
                return employees.Select(e => new AttendanceRecordDto
                {
                    EmployeeName = $"{e.FirstName} {e.LastName}",
                    EmployeeId = e.EmployeeCode,
                    Department = e.Department?.DepartmentName ?? "N/A",
                    Plant = e.WorkLocation?.LocationName ?? "N/A",
                    Status = $"Holiday ({holiday.Description})", // Set the status to Holiday with description
                    Overtime = "0:00"
                }).ToList();
            }

            var query = _context.Tbl_Attendance
                .Include(a => a.Employee).ThenInclude(e => e.Department)
                .Include(a => a.Employee).ThenInclude(e => e.WorkLocation)
                .Where(a => a.Date.Date == date.Date && !a.IsDeleted);

            if (currentUserRole == "Admin" || currentUserRole == "Account")
            {
                _logger.LogInformation("User is Admin. Fetching all attendance records.");
            }
            else if (currentUserRole == "HR")
            {
                query = query.Where(a => a.Employee.DepartmentID == currentUserDeptId);
            }
            else
            {
                query = query.Where(a => a.EmployeeID == currentEmployeeId);
            }

            var records = await query.ToListAsync();

            if (date.DayOfWeek == WeeklyOffDay)
            {
                IQueryable<Employees> employeeQuery = _context.Employees
                    .Where(e => e.IsActive && !e.IsDeleted)
                    .Include(e => e.Department)
                    .Include(e => e.WorkLocation);

                if (currentUserRole == "HR")
                {
                    employeeQuery = employeeQuery
                        .Where(e => e.DepartmentID == currentUserDeptId);
                }
                else if (currentUserRole != "Admin" || currentUserRole == "Account")
                {
                    employeeQuery = employeeQuery
                        .Where(e => e.ID == currentEmployeeId);
                }

                var employees = await employeeQuery.ToListAsync();

                return employees.Select(e => new AttendanceRecordDto
                {
                    EmployeeName = $"{e.FirstName} {e.LastName}",
                    EmployeeId = e.EmployeeCode,
                    Department = e.Department?.DepartmentName ?? "N/A",
                    Plant = e.WorkLocation?.LocationName ?? "N/A",
                    Status = "Weekly Off",
                    Overtime = "0:00"
                }).ToList();
            }

            var outdoorEmployeeIds = await _context.Tbl_OutdoorDuties
                .Where(od => od.Status == "Approved" && !od.IsDeleted &&
                             od.FromDate <= date && od.ToDate >= date)
                .Select(od => od.EmployeeID)
                .ToListAsync();

            var outdoorSet = new HashSet<int>(outdoorEmployeeIds);

            // Map records and override status if employee is on OD
            return records.Select(r => MapToDto(r, outdoorSet.Contains(r.EmployeeID))).ToList();
        }

        private async Task<AttendanceRecordDto> GetMappedRecordByIdAsync(int id)
        {
            var attendance = await _context.Tbl_Attendance
               .AsNoTracking()
               .Include(a => a.Employee).ThenInclude(e => e.Department)
               .Include(a => a.Employee).ThenInclude(e => e.WorkLocation)
               .FirstOrDefaultAsync(a => a.Id == id);

            if (attendance == null) return null;

            // Check OD for this specific record
            bool isOutdoor = await _context.Tbl_OutdoorDuties
                .AnyAsync(od => od.EmployeeID == attendance.EmployeeID &&
                                od.Status == "Approved" && !od.IsDeleted &&
                                od.FromDate <= attendance.Date && od.ToDate >= attendance.Date);

            return MapToDto(attendance, isOutdoor);
        }

        //private static AttendanceRecordDto MapToDto(Models.Attendance attendance, bool isOutdoor = false)
        private static AttendanceRecordDto MapToDto(AttendanceModel attendance, bool isOutdoor = false)
        {
            var shiftStartTime = attendance.Date.Date.AddHours(9);
            var shiftEndTime = attendance.Date.Date.AddHours(18);
            var gracePeriodEndTime = attendance.Date.Date.AddHours(9).AddMinutes(11);
            var standardWorkDuration = shiftEndTime - shiftStartTime;
            var halfDayWorkThreshold = TimeSpan.FromHours(5);

            var dto = new AttendanceRecordDto
            {
                EmployeeName = $"{attendance.Employee?.FirstName} {attendance.Employee?.LastName}",
                EmployeeId = attendance.Employee?.EmployeeCode ?? "N/A",
                Department = attendance.Employee?.Department?.DepartmentName ?? "N/A",
                Plant = attendance.Employee?.WorkLocation?.LocationName ?? "N/A",
                Status = attendance.Status.ToString().Replace("Day", " Day"),
                Overtime = "0:00"
            };

            if (attendance.InTime.HasValue)
            {
                var lateInfo = "";
                if (attendance.InTime.Value >= gracePeriodEndTime)
                {
                    var lateDuration = attendance.InTime.Value - shiftStartTime;
                    var totalLateMinutes = (int)lateDuration.TotalMinutes;
                    if (totalLateMinutes < 60) { lateInfo = $"({totalLateMinutes}min late)"; }
                    else { lateInfo = $"({lateDuration.Hours}hr {lateDuration.Minutes}min late)"; }
                }
                dto.InTime = new InTimeDetails { Time = attendance.InTime.Value.ToString("hh:mm tt"), LateInfo = lateInfo };
            }

            if (attendance.InTime.HasValue && attendance.OutTime.HasValue)
            {
                var totalWorkTime = attendance.OutTime.Value - attendance.InTime.Value;
                dto.OutTime = attendance.OutTime.Value.ToString("hh:mm tt");
                dto.TotalHours = $"{Math.Floor(totalWorkTime.TotalHours)}:{totalWorkTime.Minutes:D2}";

                if (!isOutdoor && totalWorkTime > standardWorkDuration)
                {
                    var overtime = totalWorkTime - standardWorkDuration;
                    dto.Overtime = $"{Math.Floor(overtime.TotalHours)}:{overtime.Minutes:D2}";
                }

                if (!isOutdoor && totalWorkTime < halfDayWorkThreshold) { dto.Status = "Half Day"; }
            }
            else if (attendance.InTime.HasValue)
            {
                dto.OutTime = null;
                dto.TotalHours = null;
                dto.Status = "Checked-In";
            }

            if (attendance.Status == AttendanceStatus.Absent || attendance.Status == AttendanceStatus.OnLeave || attendance.Status == AttendanceStatus.HalfDay)
            {
                dto.Status = attendance.Status.ToString().Replace("Day", " Day");
            }

            if (isOutdoor)
            {
                dto.Status = "Outdoor";
            }

            return dto;
        }

        public async Task<AttendanceRecordDto> GetAttendanceByEmployeeAndDateAsync(int employeeId, DateTime date)
        {
            var attendance = await _context.Tbl_Attendance
               .AsNoTracking()
               .Include(a => a.Employee).ThenInclude(e => e.Department)
               .Include(a => a.Employee).ThenInclude(e => e.WorkLocation)
               .FirstOrDefaultAsync(a => a.EmployeeID == employeeId && a.Date.Date == date.Date);

            if (attendance == null) return null;

            bool isOutdoor = await _context.Tbl_OutdoorDuties
                .AnyAsync(od => od.EmployeeID == employeeId &&
                                od.Status == "Approved" && !od.IsDeleted &&
                                od.FromDate <= date && od.ToDate >= date);

            return MapToDto(attendance, isOutdoor);
        }

        public async Task MarkAbsenteesAsync()
        {
            var today = DateTime.Today;
            if (today.DayOfWeek == DayOfWeek.Sunday) return;

            var employeesWithAttendance = await _context.Tbl_Attendance
                .Where(a => a.Date.Date == today && !a.IsDeleted)
                .Select(a => a.EmployeeID)
                .ToListAsync();

            var employeesOnLeave = await _context.Tb_LeaveRequests
                .Where(lr => !lr.IsDeleted && lr.Status == "Approved" && lr.FromDate.Date <= today && lr.ToDate.Date >= today)
                .Select(lr => lr.EmployeeID)
                .ToListAsync();

            var employeesOnOD = await _context.Tbl_OutdoorDuties
                .Where(od => !od.IsDeleted && od.Status == "Approved" && od.FromDate.Date <= today && od.ToDate.Date >= today)
                .Select(od => od.EmployeeID)
                .ToListAsync();

            var absentees = await _context.Employees
                .Where(e => e.IsActive && !e.IsDeleted
                       && !employeesWithAttendance.Contains(e.ID)
                       && !employeesOnLeave.Contains(e.ID)
                       && !employeesOnOD.Contains(e.ID))
                .ToListAsync();

            if (absentees.Any())
            {
                var attendanceEntries = absentees.Select(e => new AttendanceModel
                {
                    EmployeeID = e.ID,
                    Date = today,
                    Status = AttendanceStatus.Absent,
                    Notes = "Auto-marked Absent",
                    IsDeleted = false
                }).ToList();

                await _context.Tbl_Attendance.AddRangeAsync(attendanceEntries);
                await _context.SaveChangesAsync();
            }
        }

        public async Task ProcessBulkAttendanceAsync(BulkAttendanceDto bulkDto)
        {
            if (bulkDto.ToDate < bulkDto.FromDate)
            {
                throw new ArgumentException("To Date cannot be earlier than From Date.");
            }

            var currentDate = bulkDto.FromDate.Date;
            var endDate = bulkDto.ToDate.Date;

            // Iterate through each day in the range
            while (currentDate <= endDate)
            {
                // Skip Sundays (Optional: Make this configurable)
                if (currentDate.DayOfWeek == DayOfWeek.Sunday)
                {
                    currentDate = currentDate.AddDays(1);
                    continue;
                }

                // Construct exact InTime/OutTime for this specific date
                DateTime? specificInTime = null;
                DateTime? specificOutTime = null;

                if (bulkDto.InTime.HasValue)
                {
                    specificInTime = currentDate.Date + bulkDto.InTime.Value.TimeOfDay;
                }

                if (bulkDto.OutTime.HasValue)
                {
                    specificOutTime = currentDate.Date + bulkDto.OutTime.Value.TimeOfDay;
                }

                var createDto = new CreateAttendanceDto
                {
                    EmployeeId = bulkDto.EmployeeId,
                    Date = currentDate,
                    InTime = specificInTime,
                    OutTime = specificOutTime,
                    Notes = bulkDto.Notes ?? "Bulk Entry (Outdoor/Regular)",
                    // Let the AddManualAttendanceAsync logic calculate the status (Present/HalfDay)
                    // If OD exists, the Get method will override the status to "Outdoor" automatically
                    Status = AttendanceStatus.Present
                };

                // Reuse existing logic to ensure validation, late marks, and DB updates are consistent
                await AddManualAttendanceAsync(createDto);

                currentDate = currentDate.AddDays(1);
            }
        }
    }
}