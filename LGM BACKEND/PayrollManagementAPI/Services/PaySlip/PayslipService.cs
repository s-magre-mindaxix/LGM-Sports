using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.PaySlip;
using CompanyPlatform.Core.Models;
using PayrollManagementAPI.Services.Email;
using PdfSharp.Drawing;
using PdfSharp.Pdf;
using static System.Net.Mime.MediaTypeNames;
using CompanyPlatform.Core.Services.Email;

namespace PayrollManagementAPI.Services.PaySlip
{
    public class PayslipService :IPayslipService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<PayslipService> _logger;
        private readonly IEmailService _emailService;
        private readonly string _pdfFolder;
        private readonly IWebHostEnvironment _env;


        public PayslipService(ApplicationDBContext context, IEmailService emailService, ILogger<PayslipService> logger, IWebHostEnvironment env)
        {
            _context = context;
            _pdfFolder = Path.Combine(Directory.GetCurrentDirectory(), "Payslips");

            if (!Directory.Exists(_pdfFolder))
                Directory.CreateDirectory(_pdfFolder);
            _emailService = emailService;
            _logger = logger;
            _env = env;
        }

        public async Task<PayslipDto> GetPayslipDataAsync(int employeeId, int year, int month)
        {
            var salaryRecord = await _context.Tb_MonthlySalaryRecords
                .Include(r => r.Employee)
                    .ThenInclude(e => e.Designation)
                .Include(r => r.Employee)
                    .ThenInclude(e => e.Department)
                .Include(r => r.PayrollRun)
                .Include(r => r.ComponentDetails)
                .FirstOrDefaultAsync(r => r.EmployeeID == employeeId && r.PayrollRun.Year == year && r.PayrollRun.Month == month);

            var companyProfile = await _context.Tbl_CompanyProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(x => !x.IsDeleted);

            if (salaryRecord == null)
            {
                return null; 
            }

            var baseSalaryComponents = await _context.Tb_SalaryStructures
                .Include(ss => ss.SalaryComponent)
                .Where(ss => ss.EmployeeID == employeeId &&
                             ss.SalaryComponent.ComponentType == "Earning" &&
                             ss.Status == "Active" &&
                             ss.IsDeleted == false)
                .ToListAsync();

            var statutoryDetails = await _context.Tb_EmployeeStatutoryDetails
             .FirstOrDefaultAsync(s => s.EmployeeID == employeeId);

            var payslipDto = new PayslipDto
            {
                PayslipMonthYear = new DateTime(year, month, 1).ToString("MMMM yyyy"),
                DateOfIssue = salaryRecord.PayrollRun.ProcessedDate,

                EmployeeCode = salaryRecord.Employee.EmployeeCode,
                FullName = $"{salaryRecord.Employee.FirstName} {salaryRecord.Employee.LastName}",
                Designation = salaryRecord.Employee.Designation?.DesignationName,
                DateOfJoining = salaryRecord.Employee.DateOfJoining,
                DateOfBirth = salaryRecord.Employee.DateOfBirth,
                EmailId = salaryRecord.Employee.EmailAddress,
                Department = salaryRecord.Employee.Department?.DepartmentName,

                PfNumber = statutoryDetails?.PFNo ?? "N/A",
                UanNumber = statutoryDetails?.UANNo ?? "N/A",
                EsicNumber = statutoryDetails?.ESINo ?? "N/A",

                TotalDaysInMonth = salaryRecord.TotalDaysInMonth,
                PayableDays = salaryRecord.PayableDays,
                LOPDays = salaryRecord.LOPDays,

                PresentDays = salaryRecord.PresentDays,
                WeeklyOffAndHolidays = salaryRecord.WeeklyOffAndHolidays,
                CasualLeaveDays = salaryRecord.CasualLeaveDays,

                GrossEarnings = salaryRecord.GrossEarnings,
                TotalDeductions = salaryRecord.TotalDeductions,
                NetSalary = salaryRecord.NetSalary,
                //CompanyName = companyProfile?.CompanyName,
                //CompanyAddress = companyProfile?.Address,
                //Place = companyProfile?.Address,
            };

            var actualAmounts = baseSalaryComponents.ToDictionary(bc => bc.SalaryComponent.ComponentName, bc => bc.Amount);

            var monthlyEarnedAmounts = salaryRecord.ComponentDetails
                .Where(cd => cd.ComponentType.Equals("Earning", StringComparison.OrdinalIgnoreCase))
                .ToDictionary(cd => cd.ComponentName, cd => cd.Amount);

            var allComponentNames = actualAmounts.Keys.Union(monthlyEarnedAmounts.Keys).ToHashSet();

            foreach (var componentName in allComponentNames)
            {
                actualAmounts.TryGetValue(componentName, out decimal actualAmount);

                monthlyEarnedAmounts.TryGetValue(componentName, out decimal earnedAmount);

                //if (actualAmount == 0)
                //{
                //    if (componentName.Equals("Petrol Allowance", StringComparison.OrdinalIgnoreCase))
                //    {
                //        actualAmount = 1800.00m;
                //    }
                //    else if (componentName.Equals("Site Allowance", StringComparison.OrdinalIgnoreCase))
                //    {
                //        actualAmount = 150.00m;
                //    }
                //}

                payslipDto.Earnings.Add(new PayslipEarningComponent
                {
                    Name = componentName,
                    ActualAmount = actualAmount, 
                    EarnedAmount = earnedAmount  
                });
            }

            var requiredDeductionNames = new HashSet<string> {"P. T.", "TDS", "Advance" };

            var calculatedDeductions = salaryRecord.ComponentDetails
                .Where(cd => cd.ComponentType.Equals("Deduction", StringComparison.OrdinalIgnoreCase))
                .ToDictionary(cd => cd.ComponentName, cd => cd.Amount);

            var allDeductionNamesToShow = requiredDeductionNames.Union(calculatedDeductions.Keys).ToList();

            foreach (var name in allDeductionNamesToShow)
            {
                calculatedDeductions.TryGetValue(name, out decimal amount);

                payslipDto.Deductions.Add(new PayslipComponent { Name = name, Amount = amount });
            }

            payslipDto.Deductions = payslipDto.Deductions.OrderBy(d => d.Name).ToList();

            if (salaryRecord.EmployerPF > 0)
            {
                payslipDto.EmployerContributions.Add(new PayslipComponent
                {
                    Name = "Employer P.F.",
                    Amount = salaryRecord.EmployerPF
                });
            }

            return payslipDto;
        }

        //public async Task<AttendanceReportDto> GetMonthlyAttendanceAsync(int employeeId, int year, int month)
        //{
        //    var startDate = new DateTime(year, month, 1);
        //    var endDate = startDate.AddMonths(1).AddDays(-1);
        //    int totalDaysInMonth = DateTime.DaysInMonth(year, month);

        //    // Get all attendance records for the month
        //    var attendanceRecords = await _context.Tbl_Attendance
        //        .Where(a => a.EmployeeID == employeeId && a.Date >= startDate && a.Date <= endDate && !a.IsDeleted)
        //        .ToListAsync();

        //    // Get all approved leave requests for the month
        //    var leaveRequests = await _context.Tb_LeaveRequests
        //        .Include(lr => lr.LeaveType)
        //        .Where(lr => lr.EmployeeID == employeeId &&
        //                     lr.FromDate <= endDate &&
        //                     lr.ToDate >= startDate &&
        //                     lr.Status == "Approved" && !lr.IsDeleted)
        //        .ToListAsync();

        //    // Get all holidays for the month
        //    var holidays = await _context.Tbl_Holidays
        //        .Where(h => h.Date >= startDate && h.Date <= endDate && !h.IsDeleted)
        //        .Select(h => h.Date.Date)
        //        .ToListAsync();

        //    DateTime? lastAttendanceDay = attendanceRecords
        //   .Where(a => a.Status == AttendanceStatus.Present || a.Status == AttendanceStatus.HalfDay)
        //   .Select(a => (DateTime?)a.Date)
        //   .OrderByDescending(d => d)
        //   .FirstOrDefault();

        //    DateTime? lastPaidLeaveDay = leaveRequests
        //        .Where(l => IsLeaveTypePaid(l.LeaveType)) // Assuming IsLeaveTypePaid helper exists here too
        //        .Select(l => (DateTime?)l.ToDate)
        //        .OrderByDescending(d => d)
        //        .FirstOrDefault();

        //    DateTime lastActiveDay = DateTime.MinValue;
        //    if (lastAttendanceDay.HasValue) lastActiveDay = lastAttendanceDay.Value;
        //    if (lastPaidLeaveDay.HasValue && lastPaidLeaveDay.Value.Date > lastActiveDay.Date) lastActiveDay = lastPaidLeaveDay.Value;


        //    // Get all approved outdoor duty requests for the month from the 'tbl_OutdoorDuty' table
        //    var outdoorDutyRequests = await _context.Tbl_OutdoorDuties 
        //        .Where(od => od.EmployeeID == employeeId &&
        //                        od.FromDate <= endDate &&
        //                        od.ToDate >= startDate &&
        //                        od.Status == "Approved" && // Assuming an "Approved" status
        //                        !od.IsDeleted)
        //        .ToListAsync();

        //    decimal outdoorDutyDays = 0;
        //    foreach (var od in outdoorDutyRequests)
        //    {
        //        var dutyStartDate = od.FromDate > startDate ? od.FromDate : startDate;
        //        var dutyEndDate = od.ToDate < endDate ? od.ToDate : endDate;
        //        // Calculate the number of days for the duty within the current month
        //        outdoorDutyDays += (decimal)(dutyEndDate - dutyStartDate).TotalDays + 1;
        //    }

        //    var cOffDates = leaveRequests
        //    .Where(lr => lr.LeaveType.LeaveTypeName.Equals("C-Off", StringComparison.OrdinalIgnoreCase))
        //    .SelectMany(lr => Enumerable.Range(0, 1 + lr.ToDate.Subtract(lr.FromDate).Days)
        //                                .Select(offset => lr.FromDate.AddDays(offset).Date))
        //    .Where(d => d >= startDate && d <= endDate)
        //    .ToHashSet();

        //    // 2. Modify the Present Days calculation to EXCLUDE any date that is a C-Off day.
        //    decimal presentDays = attendanceRecords
        //        .Count(a => a.Status == AttendanceStatus.Present && !cOffDates.Contains(a.Date.Date));

        //    //decimal totalDaysMarkedAsPresent = attendanceRecords
        //    //.Count(a => a.Status == AttendanceStatus.Present && !cOffDates.Contains(a.Date.Date));

        //    //// The actual "in-office" present days are the total 'Present' records minus the days spent on outdoor duty.
        //    //decimal presentDays = totalDaysMarkedAsPresent - outdoorDutyDays;

        //    decimal halfDaysAsPresent = (decimal)(attendanceRecords
        //        .Count(a => a.Status == AttendanceStatus.HalfDay && !cOffDates.Contains(a.Date.Date)) * 0.5);

        //    presentDays += halfDaysAsPresent;


        //    var leaveDetails = new List<LeaveBreakdown>();
        //    decimal totalLeaveDays = 0;

        //    foreach (var leave in leaveRequests)
        //    {
        //        var leaveStartDate = leave.FromDate > startDate ? leave.FromDate : startDate;
        //        var leaveEndDate = leave.ToDate < endDate ? leave.ToDate : endDate;
        //        var daysInMonth = (leaveEndDate - leaveStartDate).Days + 1;

        //        totalLeaveDays += daysInMonth;
        //        leaveDetails.Add(new LeaveBreakdown { LeaveType = leave.LeaveType.LeaveTypeName, Days = daysInMonth });
        //    }

        //    // Assuming Saturday and Sunday are weekly offs
        //    int weeklyOffs = 0;
        //    for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
        //    {
        //        if (lastActiveDay != DateTime.MinValue && date.Date > lastActiveDay.Date)
        //        {
        //            continue; // Do not count any weekly offs after the employee has left
        //        }

        //        if (date.DayOfWeek == DayOfWeek.Sunday)
        //        {
        //            // check if there is a leave or attendance record on a weekly off, if so, it's not a weekly off
        //            if (!leaveRequests.Any(lr => date >= lr.FromDate && date <= lr.ToDate) &&
        //                !attendanceRecords.Any(ar => ar.Date.Date == date.Date))
        //            {
        //                weeklyOffs++;
        //            }
        //        }
        //    }

        //    decimal paidHolidays = holidays.Count(h => h.DayOfWeek != DayOfWeek.Sunday &&
        //(lastActiveDay == DateTime.MinValue || h.Date <= lastActiveDay.Date));

        //    var earnedLeave = leaveDetails.Where(ld => ld.LeaveType == "Earned Leave").Sum(ld => ld.Days);
        //    var casualLeave = leaveDetails.Where(ld => ld.LeaveType == "Casual Leave").Sum(ld => ld.Days);

        //    var compensatoryOff = leaveDetails.Where(ld => ld.LeaveType.Equals("C-Off", StringComparison.OrdinalIgnoreCase)).Sum(ld => ld.Days);

        //    var weeklyOffAndHolidays = weeklyOffs + paidHolidays +compensatoryOff;

        //    var paidDays = presentDays + weeklyOffs + paidHolidays + totalLeaveDays;

        //    return new AttendanceReportDto
        //    {
        //        EmployeeId = employeeId,
        //        Year = year,
        //        Month = month,
        //        TotalDaysInMonth = totalDaysInMonth,
        //        PresentDays = presentDays,
        //        OutdoorDutyDays = outdoorDutyDays,
        //        WeeklyOffs = weeklyOffs,
        //        PaidHolidays = paidHolidays,
        //        EarnedLeave = earnedLeave,
        //        CasualLeave = casualLeave,
        //        PaidDays = paidDays,
        //        LeaveDetails = leaveDetails,
        //        CompensatoryOff = compensatoryOff,
        //        WeeklyOffAndHolidays = weeklyOffAndHolidays,
        //    };
        //}

        public async Task<AttendanceReportDto> GetMonthlyAttendanceAsync(int employeeId, int year, int month)
        {

            // 1. Prioritize fetching the processed salary record. This is the single source of truth.
            var salaryRecord = await _context.Tb_MonthlySalaryRecords
                .Include(r => r.PayrollRun) // Ensure we can filter by year and month
                .FirstOrDefaultAsync(r => r.EmployeeID == employeeId &&
                                            r.PayrollRun.Year == year &&
                                            r.PayrollRun.Month == month);

            // 2. If a processed record exists, use its data directly.
            if (salaryRecord != null)
            {
                // We can still fetch the leave breakdown for the report, even if we use the summary from the record.
                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);

                var leaveRequests = await _context.Tb_LeaveRequests
                    .Include(lr => lr.LeaveType)
                    .Where(lr => lr.EmployeeID == employeeId &&
                                 lr.FromDate <= endDate &&
                                 lr.ToDate >= startDate &&
                                 lr.Status == "Approved" && !lr.IsDeleted)
                    .ToListAsync();

                var leaveDetails = new List<LeaveBreakdown>();
                foreach (var leave in leaveRequests)
                {
                    var leaveStartDate = leave.FromDate > startDate ? leave.FromDate : startDate;
                    var leaveEndDate = leave.ToDate < endDate ? leave.ToDate : endDate;
                    var daysInMonth = (leaveEndDate - leaveStartDate).Days + 1;
                    leaveDetails.Add(new LeaveBreakdown { LeaveType = leave.LeaveType.LeaveTypeName, Days = daysInMonth });
                }

                var compensatoryOff = leaveDetails.Where(ld => ld.LeaveType.Equals("C-Off", StringComparison.OrdinalIgnoreCase)).Sum(ld => ld.Days);

                // Map the definitive values from the salary record to the DTO.
                return new AttendanceReportDto
                {
                    EmployeeId = employeeId,
                    Year = year,
                    Month = month,
                    TotalDaysInMonth = salaryRecord.TotalDaysInMonth,
                    PresentDays = salaryRecord.PresentDays,
                    WeeklyOffAndHolidays = salaryRecord.WeeklyOffAndHolidays,
                    CasualLeave = salaryRecord.CasualLeaveDays,
                    PaidDays = salaryRecord.PayableDays, // This is the total payable days
                    LeaveDetails = leaveDetails, // Provide the breakdown
                    CompensatoryOff = compensatoryOff,
                    EarnedLeave = leaveDetails.Where(ld => ld.LeaveType == "Earned Leave").Sum(ld => ld.Days),

                 
                    WeeklyOffs = 0,
                    PaidHolidays = 0,
                    OutdoorDutyDays = 0, 
                };
            }

         

            var liveStartDate = new DateTime(year, month, 1);
            var liveEndDate = liveStartDate.AddMonths(1).AddDays(-1);
            int totalDaysInMonth = DateTime.DaysInMonth(year, month);

            var attendanceRecords = await _context.Tbl_Attendance
                .Where(a => a.EmployeeID == employeeId && a.Date >= liveStartDate && a.Date <= liveEndDate && !a.IsDeleted)
                .ToListAsync();

            var liveLeaveRequests = await _context.Tb_LeaveRequests
                .Include(lr => lr.LeaveType)
                .Where(lr => lr.EmployeeID == employeeId &&
                                lr.FromDate <= liveEndDate &&
                                lr.ToDate >= liveStartDate &&
                                lr.Status == "Approved" && !lr.IsDeleted)
                .ToListAsync();

           

            return null; 
        }

        private bool IsLeaveTypePaid(CompanyPlatform.Core.Models.LeaveType leaveType)
        {
            if (leaveType == null || string.IsNullOrWhiteSpace(leaveType.LeaveTypeName))
            {
                return false;
            }
            string leaveName = leaveType.LeaveTypeName.Trim();
            if (leaveName.Equals("Unpaid Leave", StringComparison.OrdinalIgnoreCase) ||
                leaveName.Equals("LWP", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
            return true;
        }

        public async Task<MonthlyWorkDaysDto> GetMonthlyWorkDaysSummaryAsync(int year, int month)
        {
            int totalDaysInMonth = DateTime.DaysInMonth(year, month);

            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            // Count Sundays dynamically
            int weeklyOffs = Enumerable.Range(0, totalDaysInMonth)
                .Count(i => startDate.AddDays(i).DayOfWeek == DayOfWeek.Sunday);

            // Step 1: Get holidays from DB (EF can translate this)
            var holidays = await _context.Tbl_Holidays
                .Where(h => h.Date >= startDate &&
                            h.Date <= endDate &&
                            !h.IsDeleted)
                .ToListAsync();

            // Step 2: Now safely filter Sundays in memory
            int paidHolidays = holidays
                .Count(h => h.Date.DayOfWeek != DayOfWeek.Sunday);

            int standardWorkingDays = totalDaysInMonth - weeklyOffs - paidHolidays;

            return new MonthlyWorkDaysDto
            {
                StandardWorkingDays = standardWorkingDays,
                WeeklyOffs = weeklyOffs,
                PaidHolidays = paidHolidays,
                TotalDays = totalDaysInMonth
            };
        }

        public async Task<IEnumerable<LeaveBalanceDto>> GetLeaveBalanceForPayslipAsync(int employeeId, int year, int month)
        {
            var startDateOfMonth = new DateTime(year, month, 1);
            var endDateOfMonth = startDateOfMonth.AddMonths(1).AddDays(-1);

            // 2. Determine the financial year for the given date
            // (Assuming financial year starts in April)
            int financialYear = (month >= 4) ? year : year - 1;

            var assignedLeaves = await _context.Tb_AssignLeaveTypes
                .Include(alt => alt.LeaveType) 
                .Where(alt => alt.EmployeeID == employeeId && alt.FinancialYear == financialYear && !alt.IsDeleted)
                .ToListAsync();

            if (!assignedLeaves.Any())
            {
                return new List<LeaveBalanceDto>();
            }

            var leaveBalances = new List<LeaveBalanceDto>();

            foreach (var assignedLeave in assignedLeaves)
            {
                var leavesTakenPreviously = await _context.Tb_LeaveRequests
                    .Where(lr =>
                        lr.EmployeeID == employeeId &&
                        lr.LeaveTypeID == assignedLeave.LeaveTypeID &&
                        lr.Status == "Approved" && 
                        lr.FromDate < startDateOfMonth && 
                        lr.FromDate.Year >= financialYear && 
                        !lr.IsDeleted)
                    .SumAsync(lr => lr.Days);

                // 5. Calculate leaves taken *during* the current month
                var leavesTakenThisMonth = await _context.Tb_LeaveRequests
                    .Where(lr =>
                        lr.EmployeeID == employeeId &&
                        lr.LeaveTypeID == assignedLeave.LeaveTypeID &&
                        lr.Status == "Approved" &&
                        lr.FromDate >= startDateOfMonth && // Leaves that started in this month
                        lr.FromDate <= endDateOfMonth &&
                        !lr.IsDeleted)
                    .SumAsync(lr => lr.Days);

                // 6. Calculate the balances
                var openingBalance = assignedLeave.AllocatedDays - leavesTakenPreviously;
                var closingBalance = openingBalance - leavesTakenThisMonth;

                leaveBalances.Add(new LeaveBalanceDto
                {
                    LeaveTypeName = assignedLeave.LeaveType.LeaveTypeName,
                    OpeningBalance = openingBalance,
                    LeavesTakenThisMonth = leavesTakenThisMonth,
                    ClosingBalance = closingBalance
                });
            }

            return leaveBalances;
        }

        public async Task<AdvanceBalanceDto> GetAdvanceBalanceForPayslipAsync(int employeeId, int year, int month)
        {
            var startDateOfMonth = new DateTime(year, month, 1);
            var endDateOfMonth = startDateOfMonth.AddMonths(1).AddDays(-1);

            var totalAdvancesTakenBeforeMonth = await _context.Tbl_Advances
                .Where(a => a.EmployeeID == employeeId &&
                            a.Status == "Partially Paid" &&
                            a.StatusDate < startDateOfMonth &&
                            !a.IsDeleted)
                .SumAsync(a => (decimal?)a.Amount) ?? 0; // Use nullable sum to handle no records

            var totalRepaymentsMadeBeforeMonth = await _context.Tbl_AdvanceRepayments
                .Where(ar => ar.Advance.EmployeeID == employeeId &&
                             ar.RepaymentDate < startDateOfMonth)
                .SumAsync(ar => (decimal?)ar.RepaymentAmount) ?? 0;

            var openingBalance = totalAdvancesTakenBeforeMonth - totalRepaymentsMadeBeforeMonth;

            // 4. Calculate new APPROVED advances taken THIS month
            var newAdvanceTakenThisMonth = await _context.Tbl_Advances
                .Where(a => a.EmployeeID == employeeId &&
                            a.Status == "Partially Paid" &&
                            a.StatusDate >= startDateOfMonth &&
                            a.StatusDate <= endDateOfMonth &&
                            !a.IsDeleted)
                .SumAsync(a => (decimal?)a.Amount) ?? 0;

            // This amount would typically be a deduction on the payslip itself.
            var repaymentsThisMonth = await _context.Tbl_AdvanceRepayments
                .Where(ar => ar.Advance.EmployeeID == employeeId &&
                             ar.RepaymentDate >= startDateOfMonth &&
                             ar.RepaymentDate <= endDateOfMonth)
                .SumAsync(ar => (decimal?)ar.RepaymentAmount) ?? 0;

            // 6. Calculate Closing Balance
            var closingBalance = openingBalance + newAdvanceTakenThisMonth - repaymentsThisMonth;

            return new AdvanceBalanceDto
            {
                OpeningBalance = openingBalance,
                NewAdvanceTakenThisMonth = newAdvanceTakenThisMonth,
                ClosingBalance = closingBalance
            };
        }


        // 1. GENERATE SINGLE PAYSLIP
        // ================================================================
        public async Task<PayslipGenerateResponseDto> GeneratePayslipAsync(int payrollRunId, int employeeId)
        {
            var salary = await _context.Tb_MonthlySalaryRecords
                .Include(m => m.Employee)
                 .Include(m => m.PayrollRun)
                .Include(m => m.ComponentDetails)
                .FirstOrDefaultAsync(m => m.PayrollRunID == payrollRunId && m.EmployeeID == employeeId);

            if (salary == null)
                throw new Exception("Monthly salary record not found.");

            // STEP 1: Generate PDF FIRST (MAKE SURE this returns a valid path)
            string pdfPath = GeneratePdfFile(employeeId, salary);

            if (string.IsNullOrEmpty(pdfPath))
                throw new Exception("PDF generation failed. PdfFilePath is NULL.");

            // STEP 2: Create payslip entry AFTER pdfPath is available
            var payslip = new Payslip
            {
                PayrollRunID = payrollRunId,
                EmployeeID = employeeId,
                PdfFilePath = pdfPath,
                GeneratedOn = DateTime.UtcNow,
                EmailSent = false,
                Downloaded = false
            };

            _context.Tbl_Payslips.Add(payslip);
            await _context.SaveChangesAsync(); 

        
            return new PayslipGenerateResponseDto
            {
                PayslipId = payslip.Id,
                PdfFilePath = pdfPath,
                Message = "Payslip generated successfully.",
                EmailSent = payslip.EmailSent

            };
        }
        // ================================================================
        // 2. GENERATE ALL PAYSLIPS
        // ================================================================
        //public async Task<IEnumerable<PayslipDetailDto>> GenerateAllPayslipsAsync(int payrollRunId)
        //{
        //    var records = await _context.Tb_MonthlySalaryRecords
        //        .Include(r => r.Employee)
        //        .Where(r => r.PayrollRunID == payrollRunId)
        //        .ToListAsync();

        //    List<PayslipDetailDto> result = new();

        //    foreach (var rec in records)
        //    {
        //        var res = await GeneratePayslipAsync(payrollRunId, rec.EmployeeID);

        //        result.Add(new PayslipDetailDto
        //        {
        //            PayslipId = res.PayslipId,
        //            EmployeeId = rec.EmployeeID,
        //            EmployeeName = rec.Employee.FirstName + " "+ rec.Employee.LastName,
        //            EmployeeCode = rec.Employee.EmployeeCode,
        //            GrossSalary = rec.GrossEarnings,
        //            NetSalary = rec.NetSalary,
        //            PdfFilePath = res.PdfFilePath,
        //            EmailSent = res.EmailSent,
        //            Downloaded = false
        //        });
        //    }

        //    return result;
        //}

        public async Task<IEnumerable<PayslipDetailDto>> GenerateAllPayslipsAsync(int payrollRunId)
        {
            var records = await _context.Tb_MonthlySalaryRecords
                .Include(r => r.Employee)
                .Where(r => r.PayrollRunID == payrollRunId)
                .ToListAsync();

            var resultList = new List<PayslipDetailDto>();

            foreach (var record in records)
            {
                var singlePayslipResult = await GeneratePayslipAsync(payrollRunId, record.EmployeeID);

                resultList.Add(new PayslipDetailDto
                {
                    PayslipId = singlePayslipResult.PayslipId,
                    EmployeeId = record.EmployeeID,
                    EmployeeName = $"{record.Employee.FirstName} {record.Employee.LastName}",
                    EmployeeCode = record.Employee.EmployeeCode,
                    GrossSalary = record.GrossEarnings,
                    NetSalary = record.NetSalary,
                    PdfFilePath = singlePayslipResult.PdfFilePath,
                    EmailSent = singlePayslipResult.EmailSent, 
                    Downloaded = false 
                });
            }

            return resultList;
        }

        // ================================================================
        // 3. ADMIN/HR VIEW ALL PAYSLIPS
        // ================================================================
        public async Task<IEnumerable<PayslipDetailDto>> GetAllPayslipsForRunAsync(int payrollRunId)
        {
            var payslips = await _context.Tbl_Payslips
                .Include(p => p.Employee)
                 .ThenInclude(e => e.Department)
                .Where(p => p.PayrollRunID == payrollRunId)
                .ToListAsync();

            return payslips.Select(p => new PayslipDetailDto
            {
                PayslipId = p.Id,
                EmployeeId = p.EmployeeID,
                EmployeeName = p.Employee.FirstName + " " + p.Employee.LastName,
                EmployeeCode = p.Employee.EmployeeCode,
                DepartmentId = p.Employee.DepartmentID ?? 0, 
                Department = p.Employee.Department?.DepartmentName,
                PdfFilePath = p.PdfFilePath,
                EmailSent = p.EmailSent,
                Downloaded = p.Downloaded,
                GrossSalary = _context.Tb_MonthlySalaryRecords
                    .Where(x => x.EmployeeID == p.EmployeeID && x.PayrollRunID == payrollRunId)
                    .Select(x => x.GrossEarnings)
                    .FirstOrDefault(),
                NetSalary = _context.Tb_MonthlySalaryRecords
                    .Where(x => x.EmployeeID == p.EmployeeID && x.PayrollRunID == payrollRunId)
                    .Select(x => x.NetSalary)
                    .FirstOrDefault()
            });
        }

        // ================================================================
        // 4. SUMMARY DASHBOARD
        // ================================================================
        public async Task<PayslipSummaryDto> GetPayslipSummaryAsync(int payrollRunId)
        {
            var payslips = await _context.Tbl_Payslips
                .Where(p => p.PayrollRunID == payrollRunId)
                .ToListAsync();

            return new PayslipSummaryDto
            {
                TotalGenerated = payslips.Count,
                EmailSent = payslips.Count(p => p.EmailSent),
                TotalDownloads = payslips.Count(p => p.Downloaded)
            };
        }

        // ================================================================
        // 5. DOWNLOAD PAYSLIP (ADMIN/HR/EMPLOYEE)
        // ================================================================
        public async Task<byte[]> DownloadPayslipAsync(int payslipId, int loggedInEmployeeId, string role)
        {
            var payslip = await _context.Tbl_Payslips
                .FirstOrDefaultAsync(p => p.Id == payslipId);

            if (payslip == null) return null;

            // Employee can download **only his own** payslip
            if (role == "Employee" && payslip.EmployeeID != loggedInEmployeeId)
                throw new UnauthorizedAccessException("Employee cannot download other employee's payslip.");

            if (!File.Exists(payslip.PdfFilePath))
                return null;

            payslip.Downloaded = true;
            await _context.SaveChangesAsync();

            return await File.ReadAllBytesAsync(payslip.PdfFilePath);
        }

        // ================================================================
        // 6. EMPLOYEE’S PAYSLIP HISTORY
        // ================================================================
        public async Task<IEnumerable<EmployeePayslipListDto>> GetEmployeePayslipHistoryAsync(int employeeId)
        {
            return await _context.Tbl_Payslips
                .Include(p => p.PayrollRun)
                .Where(p => p.EmployeeID == employeeId)
                .Select(p => new EmployeePayslipListDto
                {
                    PayslipId = p.Id,
                    MonthYear = $"{p.PayrollRun.Month}-{p.PayrollRun.Year}",
                    NetSalary = _context.Tb_MonthlySalaryRecords
                                    .Where(r => r.EmployeeID == employeeId && r.PayrollRunID == p.PayrollRunID)
                                    .Select(r => r.NetSalary)
                                    .FirstOrDefault(),
                    Downloaded = p.Downloaded
                })
                .ToListAsync();
        }


        // ================================================================
        // PDF GENERATOR (Simple Template)
        // ================================================================
        private string GeneratePdfFile(int employeeId, MonthlySalaryRecord salary)
        {
            string folder = Path.Combine(_env.WebRootPath, "Payslips");

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            string filePath = Path.Combine(folder, $"Payslip_{employeeId}_{salary.PayrollRunID}.pdf");


            File.WriteAllText(filePath, "PDF Placeholder");

            return filePath;
        }

        public async Task<PayrollRunDto> GetActivePayrollRunAsync()
        {
            var latestRun = await _context.Tb_PayrollRuns 
                .OrderByDescending(pr => pr.Year)
                .ThenByDescending(pr => pr.Month)
                .FirstOrDefaultAsync();

            if (latestRun == null)
            {
                throw new Exception("No payroll run has been processed yet.");
            }

            return new PayrollRunDto
            {
                Id = latestRun.Id,
                Year = latestRun.Year,
                Month = latestRun.Month
            };
        }

        public async Task MarkAsDownloadedAsync(int payslipId)
        {
            var payslip = await _context.Tbl_Payslips.FindAsync(payslipId);
            if (payslip != null && !payslip.Downloaded) 
            {
                payslip.Downloaded = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<PayrollRunDto>> GetAllPayrollRunsAsync()
        {
            var allRuns = await _context.Tb_PayrollRuns
                .OrderByDescending(pr => pr.Year)
                .ThenByDescending(pr => pr.Month)
                .Select(pr => new PayrollRunDto
                {
                    Id = pr.Id,
                    Year = pr.Year,
                    Month = pr.Month
                })
                .ToListAsync();

            return allRuns;
        }

        public async Task EmailUploadedPayslipAsync(IFormFile file, int payslipId, int employeeId, int payrollRunId)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("A valid file must be provided to be emailed.");
            }

            var payslip = await _context.Tbl_Payslips
                .Include(p => p.Employee)   
                .Include(p => p.PayrollRun) 
                .FirstOrDefaultAsync(p => p.Id == payslipId);

            if (payslip == null)
            {
                throw new KeyNotFoundException($"Payslip record with ID {payslipId} not found.");
            }

            string uniqueFileName = $"Payslip_{employeeId}_{payrollRunId}.pdf";
            string filePath = Path.Combine(_pdfFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            _logger.LogInformation("Successfully saved uploaded payslip from frontend to: {FilePath}", filePath);

            payslip.PdfFilePath = filePath;

            try
            {
                string monthYear = new DateTime(payslip.PayrollRun.Year, payslip.PayrollRun.Month, 1).ToString("MMMM yyyy");

                await _emailService.SendPayslipEmailAsync(
                    payslip.Employee.EmailAddress,
                    $"{payslip.Employee.FirstName} {payslip.Employee.LastName}",
                    monthYear,
                    filePath // Use the path of the file we just saved
                );

                payslip.EmailSent = true;
                _context.Tbl_Payslips.Update(payslip);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully sent uploaded payslip as email to {Email}", payslip.Employee.EmailAddress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send the uploaded payslip via email for {Email}", payslip.Employee.EmailAddress);
                throw;
            }
        }

    }

}
