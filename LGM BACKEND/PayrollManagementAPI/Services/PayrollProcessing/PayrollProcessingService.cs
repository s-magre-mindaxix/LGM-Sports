using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.Payroll;
using CompanyPlatform.Core.Models;

using PayrollManagementAPI.Helpers;



namespace PayrollManagementAPI.Services.PayrollProcessing
{
    public class PayrollProcessingService : IPayrollProcessingService
    {
        private readonly ApplicationDBContext _context;

        public PayrollProcessingService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task ProcessPayrollAsync(int year, int month)
        {
            // 1. Check if payroll for this period has already been processed
            bool alreadyProcessed = await _context.Tb_PayrollRuns
                .AnyAsync(pr => pr.Year == year && pr.Month == month && pr.Status == "Completed");
            if (alreadyProcessed)
            {
                throw new InvalidOperationException($"Payroll for {month}/{year} has already been completed.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var payrollRun = new PayrollRun
                {
                    Year = year,
                    Month = month,
                    ProcessedDate = DateTime.UtcNow,
                    Status = "Processing",
                    ProcessedByUserID = 1018 // Placeholder for logged-in admin user ID
                };
                _context.Tb_PayrollRuns.Add(payrollRun);
                await _context.SaveChangesAsync();


                var employees = await _context.Employees
                     .Include(e => e.WorkLocation)
                    .Include(e => e.SalaryStructures)
                    .ThenInclude(ss => ss.SalaryComponent)
                    .Where(e => e.IsActive && !e.IsDeleted)
                    .ToListAsync();

                // --- NEW: Fetch settings once to avoid repeated DB calls in the loop ---
                var statutorySettings = await _context.Tb_StatutorySettings
                    .Where(s => s.IsActive && !s.IsDeleted)
                    .ToDictionaryAsync(s => s.SettingName, s => s.SettingValue);

                var allProfessionalTaxSlabs = await _context.Tb_ProfessionalTaxSlabs
                    .Where(s => !s.IsDeleted)
                    .ToListAsync();

                string financialYear = (month < 4) ? $"{year - 1}-{year}" : $"{year}-{year + 1}";

                // Fetch all tax slabs for the current financial year once to use inside the loop.
                var taxSlabsForYear = await _context.Tbl_TaxSlabs
                    .Where(ts => ts.FinancialYear == financialYear)
                    .ToListAsync();

                var totalDaysInMonth = DateTime.DaysInMonth(year, month);

                foreach (var employee in employees)
                {
                    if (employee.SalaryStructures.Any(ss => ss.Status == "Active"))
                    {
                        bool hasAnyAttendanceRecord = await _context.Tbl_Attendance
                        .AnyAsync(a => a.EmployeeID == employee.ID && a.Date.Year == year && a.Date.Month == month && !a.IsDeleted);

                        if (!hasAnyAttendanceRecord)
                        {
                            continue;
                        }

                        var attendanceSummary = await CalculateMonthlyAttendanceSummaryAsync(employee.ID, year, month);



                        //var monthStart = new DateTime(year, month, 1);
                        //var monthEnd = monthStart.AddMonths(1).AddDays(-1);

                        // Fetch Approved OD records that overlap with the current month
                        //var approvedODs = await _context.Tbl_OutdoorDuties
                        //    .Where(od => od.EmployeeID == employee.ID &&
                        //                 od.Status == "Approved" &&
                        //                 !od.IsDeleted &&
                        //                 od.FromDate <= monthEnd &&  // Starts before or in this month
                        //                 od.ToDate >= monthStart)    // Ends after or in this month
                        //    .Select(od => new { od.FromDate, od.ToDate })
                        //    .ToListAsync();

                        // Calculate actual days falling within this month
                        //int approvedOutdoorDutyDays = 0;

                        //foreach (var od in approvedODs)
                        //{
                        //    // Get the later of the two start dates
                        //    var overlapStart = od.FromDate < monthStart ? monthStart : od.FromDate;

                        //    // Get the earlier of the two end dates
                        //    var overlapEnd = od.ToDate > monthEnd ? monthEnd : od.ToDate;

                        //    // Calculate days (inclusive)
                        //    // Example: 5th to 5th = 0 days difference + 1 = 1 day
                        //    var days = (overlapEnd - overlapStart).Days + 1;

                        //    if (days > 0)
                        //    {
                        //        approvedOutdoorDutyDays += days;
                        //    }
                        //}

                        //decimal siteAllowanceAmount = approvedOutdoorDutyDays * 150.00m;

                        var salaryRecord = new MonthlySalaryRecord
                        {
                            PayrollRunID = payrollRun.Id,
                            EmployeeID = employee.ID,
                            TotalDaysInMonth = totalDaysInMonth,
                            PayableDays = attendanceSummary.PayableDays,
                            LOPDays = attendanceSummary.LOPDays,
                            PresentDays = attendanceSummary.PresentDays,
                            WeeklyOffAndHolidays = attendanceSummary.WeeklyOffAndHolidayDays,
                            CasualLeaveDays = attendanceSummary.CasualLeaveDays,
                            //ReimbursableAmount = monthlyExpenseReimbursement,
                            ReimbursableAmount = 0,
                            ComponentDetails = new List<MonthlySalaryComponentDetail>()
                        };

                        decimal proratedBasicSalary = 0;

                        // 6. Calculate prorated earnings
                        var earnings = employee.SalaryStructures
                            .Where(ss => !ss.IsDeleted &&  ss.Status == "Active" && ss.SalaryComponent.ComponentType == "Earning");

                        foreach (var earningComponent in earnings)
                        {
                            decimal proratedAmount = (earningComponent.Amount / totalDaysInMonth) * attendanceSummary.PayableDays;

                            if (earningComponent.SalaryComponent.ComponentName == "Basic Salary")
                            {
                                proratedBasicSalary = proratedAmount;
                            }

                            salaryRecord.ComponentDetails.Add(new MonthlySalaryComponentDetail
                            {
                                ComponentName = earningComponent.SalaryComponent.ComponentName,
                                ComponentType = "Earning",
                                Amount = Math.Round(proratedAmount, MidpointRounding.AwayFromZero)
                            });
                        }



                        decimal proratedGrossEarnings = salaryRecord.ComponentDetails
                         .Where(c => c.ComponentType == "Earning")
                         .Sum(c => c.Amount);

                        var pfDetails = await _context.EmployeePFDetails
                            .FirstOrDefaultAsync(p => p.EmployeeID == employee.ID && !p.IsDeleted);

                        // 2. Calculate statutory deductions dynamically using the helper

                        // Calculate PF
                        //var (employeePF, employerPF) = PayrollCalculationHelper.CalculateProvidentFund(
                        //    proratedGrossEarnings,
                        //    proratedBasicSalary,
                        //    statutorySettings,
                        //    pfDetails?.PFDeductionPercentage,
                        //    pfDetails?.IsCappedAt15k ?? false
                        //);
                        //if (employeePF > 0)
                        //{
                        //    salaryRecord.ComponentDetails.Add(new MonthlySalaryComponentDetail { ComponentName = "P. F.", ComponentType = "Deduction", Amount = Math.Ceiling(employeePF) });
                        //}

                        // Calculate Professional Tax based on employee's state
                        var stateSpecificSlabs = allProfessionalTaxSlabs
                          .Where(s => s.State.Trim().Equals("Maharashtra", StringComparison.OrdinalIgnoreCase))
                          .ToList();

                        var employeeGender = employee.Gender?.Trim() ?? "";


                        decimal professionalTax = PayrollCalculationHelper.CalculateProfessionalTax(
                            proratedGrossEarnings,
                            employeeGender,
                            stateSpecificSlabs,
                            month
                        );
                        if (professionalTax > 0)
                        {
                            salaryRecord.ComponentDetails.Add(new MonthlySalaryComponentDetail { ComponentName = "P. T.", ComponentType = "Deduction", Amount = Math.Ceiling(professionalTax) });
                        }

                       // Calculate ESIC
                        //decimal esic = PayrollCalculationHelper.CalculateESIC(
                        //    proratedGrossEarnings,
                        //    statutorySettings
                        //);
                        //if (esic > 0)
                        //{
                        //    salaryRecord.ComponentDetails.Add(new MonthlySalaryComponentDetail { ComponentName = "ESIC", ComponentType = "Deduction", Amount = Math.Ceiling(esic) });
                        //}

                        // 3. Handle deductions that ARE fixed or manually specified

                        // TDS is fetched as it is considered fixed for the month
                        //var tdsAmount = employee.SalaryStructures.FirstOrDefault(s => s.SalaryComponent.ComponentName == "TDS" && !s.IsDeleted)?.Amount ?? 0;
                        //if (tdsAmount > 0)
                        //{
                        //    salaryRecord.ComponentDetails.Add(new MonthlySalaryComponentDetail { ComponentName = "TDS", ComponentType = "Deduction", Amount = tdsAmount });
                        //}

                        var manualTdsDetail = await _context.EmployeeTDSDetails 
                        .FirstOrDefaultAsync(tds => tds.EmployeeID == employee.ID && !tds.IsDeleted);

                        if (manualTdsDetail != null && manualTdsDetail.TDSAmount > 0)
                        {
                            salaryRecord.ComponentDetails.Add(new MonthlySalaryComponentDetail
                            {
                                ComponentName = "TDS",
                                ComponentType = "Deduction",
                                Amount = manualTdsDetail.TDSAmount
                            });
                        }
                        else
                        {
                            // PRIORITY 2: No manual TDS found, so calculate it automatically.

                            // Project the annual gross salary from the employee's active, taxable salary components.
                            decimal projectedAnnualGross = employee.SalaryStructures
                                .Where(ss => ss.Status == "Active" && ss.SalaryComponent.IsTaxable && !ss.IsDeleted)
                                .Sum(ss => ss.Amount) * 12;

                            // Call the helper to get the calculated monthly TDS.
                            decimal monthlyTds = PayrollCalculationHelper.CalculateIncomeTax(
                                employee.ID,
                                financialYear,
                                projectedAnnualGross,
                                statutorySettings,
                                taxSlabsForYear, 
                                _context  
                            );

                            if (monthlyTds > 0)
                            {
                                salaryRecord.ComponentDetails.Add(new MonthlySalaryComponentDetail
                                {
                                    ComponentName = "TDS",
                                    ComponentType = "Deduction",
                                    Amount = monthlyTds
                                });
                            }
                        }


                        // Check if the current month is June (6) or December (12) for LWF deduction (Maharashtra rule).
                        //if (month == 6 || month == 12)
                        //{
                        //    salaryRecord.ComponentDetails.Add(new MonthlySalaryComponentDetail
                        //    {
                        //        ComponentName = "LWF",
                        //        ComponentType = "Deduction",
                        //        Amount = 25.00m // Fixed employee contribution for Maharashtra
                        //    });
                        //}

                        // Get all advance repayments done by the employee in this payroll month
                        var totalMonthlyRepayment = await _context.Tbl_AdvanceRepayments
                         .Where(r =>
                             r.Advance.EmployeeID == employee.ID &&
                             r.RepaymentDate.Year == year &&
                             r.RepaymentDate.Month == month)
                         .SumAsync(r => r.RepaymentAmount);

                        if (totalMonthlyRepayment > 0)
                        {
                            salaryRecord.ComponentDetails.Add(new MonthlySalaryComponentDetail
                            {
                                ComponentName = "Advance",
                                ComponentType = "Deduction",
                                Amount = totalMonthlyRepayment
                            });
                        }

                        //decimal pfThreshold = decimal.TryParse(statutorySettings.GetValueOrDefault("PF Threshold"), out var th) ? th : 15000m;
                        //decimal rateBelowThreshold = decimal.TryParse(statutorySettings.GetValueOrDefault("PF Rate Below Threshold"), out var rbt) ? rbt : 12.0m;
                        //decimal employerFixedContribution = decimal.TryParse(statutorySettings.GetValueOrDefault("PF Employer Contribution Fixed"), out var efc) ? efc : 1800m;

                        //decimal finalEmployerPF = 0;

                        //if (proratedGrossEarnings > 0)
                        //{
                        //    if (proratedGrossEarnings <= pfThreshold)
                        //    {
                        //        finalEmployerPF = proratedGrossEarnings * (rateBelowThreshold / 100m);
                        //    }
                        //    else
                        //    {
                        //        finalEmployerPF = employerFixedContribution;
                        //    }
                        //}

                        //salaryRecord.EmployerPF = Math.Ceiling(employerPF);

                        // 8. Final Calculation and Save
                        salaryRecord.GrossEarnings = salaryRecord.ComponentDetails
                            .Where(cd => cd.ComponentType == "Earning")
                            .Sum(cd => cd.Amount);

                        salaryRecord.TotalDeductions = salaryRecord.ComponentDetails
                            .Where(cd => cd.ComponentType == "Deduction")
                            .Sum(cd => cd.Amount);

                        salaryRecord.NetSalary = salaryRecord.GrossEarnings - salaryRecord.TotalDeductions;

                        _context.Tb_MonthlySalaryRecords.Add(salaryRecord);
                    }
                }

                payrollRun.Status = "Completed";

                bool complianceExists = await _context.Tb_ComplianceFilingStatuses
                .AnyAsync(cs => cs.Year == year && cs.Month == month);

                if (!complianceExists)
                {
                    var complianceTasks = new List<ComplianceFilingStatus>();
                    var payrollDate = new DateTime(year, month, 1);

                    var pfEsicDueDate = payrollDate.AddMonths(1).AddDays(14);
                    var tdsDueDate = payrollDate.AddMonths(1).AddDays(6);
                    var ptDueDate = new DateTime(payrollDate.AddMonths(1).Year, payrollDate.AddMonths(1).Month, DateTime.DaysInMonth(payrollDate.AddMonths(1).Year, payrollDate.AddMonths(1).Month));

                    complianceTasks.Add(new ComplianceFilingStatus { ComplianceType = "PF ECR Filing", Year = year, Month = month, Status = FilingStatus.Pending, DueDate = pfEsicDueDate });
                    complianceTasks.Add(new ComplianceFilingStatus { ComplianceType = "ESIC Returns", Year = year, Month = month, Status = FilingStatus.Pending, DueDate = pfEsicDueDate });
                    complianceTasks.Add(new ComplianceFilingStatus { ComplianceType = "TDS Returns", Year = year, Month = month, Status = FilingStatus.Pending, DueDate = tdsDueDate });
                    complianceTasks.Add(new ComplianceFilingStatus { ComplianceType = "Professional Tax", Year = year, Month = month, Status = FilingStatus.Pending, DueDate = ptDueDate });

                    await _context.Tb_ComplianceFilingStatuses.AddRangeAsync(complianceTasks);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw; // Re-throw the exception to be handled by the controller
            }
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


        //public async Task<(decimal payableDays, decimal lopDays)> CalculateMonthlyAttendanceSummaryAsync(int employeeId, int year, int month)
        //{
        //    decimal payableDays = 0;
        //    decimal lopDays = 0;

        //    var startDate = new DateTime(year, month, 1);
        //    var totalDaysInMonth = DateTime.DaysInMonth(year, month);
        //    var endDate = new DateTime(year, month, totalDaysInMonth);


        //    var attendanceRecords = await _context.Tbl_Attendance
        //        .Where(a => a.EmployeeID == employeeId && a.Date >= startDate && a.Date <= endDate && !a.IsDeleted)
        //        .ToDictionaryAsync(a => a.Date.Date);

        //    var approvedLeaves = await _context.Tb_LeaveRequests
        //        .Include(lr => lr.LeaveType) 
        //        .Where(lr => lr.EmployeeID == employeeId &&
        //                     lr.Status == "Approved" &&
        //                     lr.FromDate <= endDate && lr.ToDate >= startDate && !lr.IsDeleted)
        //        .ToListAsync();

        //    var holidays = (await _context.Tbl_Holidays
        //    .Where(h => h.Date >= startDate && h.Date <= endDate)
        //    .Select(h => h.Date.Date)
        //    .ToListAsync())
        //    .ToHashSet();

        //    const DayOfWeek weeklyOff = DayOfWeek.Sunday;



        //    // Find the last day they were marked Present or HalfDay.
        //    DateTime? lastAttendanceDay = attendanceRecords.Values
        //        .Where(a => a.Status == AttendanceStatus.Present || a.Status == AttendanceStatus.HalfDay)
        //        .Select(a => (DateTime?)a.Date)
        //        .OrderByDescending(d => d)
        //        .FirstOrDefault();

        //    // Find the last day of any approved paid leave.
        //    DateTime? lastPaidLeaveDay = approvedLeaves
        //        .Where(l => IsLeaveTypePaid(l.LeaveType)) 
        //        .Select(l => (DateTime?)l.ToDate)
        //        .OrderByDescending(d => d)
        //        .FirstOrDefault();

        //    // Determine the absolute last active day from the dates found above.
        //    DateTime lastActiveDay = DateTime.MinValue;
        //    if (lastAttendanceDay.HasValue)
        //    {
        //        lastActiveDay = lastAttendanceDay.Value;
        //    }
        //    if (lastPaidLeaveDay.HasValue && lastPaidLeaveDay.Value.Date > lastActiveDay.Date)
        //    {
        //        lastActiveDay = lastPaidLeaveDay.Value;
        //    }



        //    for (int i = 0; i < totalDaysInMonth; i++)
        //    {
        //        var currentDate = startDate.AddDays(i);

        //        // If the employee has no active days this month, don't process any further days.
        //        if (lastActiveDay != DateTime.MinValue && currentDate.Date > lastActiveDay.Date)
        //        {
        //            lopDays += 1; // Or simply 'continue;' if you don't want to mark remaining days as LOP.
        //            continue;
        //        }

        //        if (holidays.Contains(currentDate.Date) || currentDate.DayOfWeek == weeklyOff)
        //        {
        //            // --- MODIFIED: Only count the holiday/weekly off if it occurs on or before the last active day ---
        //            if (lastActiveDay != DateTime.MinValue && currentDate.Date <= lastActiveDay.Date)
        //            {
        //                payableDays += 1;
        //            }
        //            continue;
        //        }


        //        if (attendanceRecords.TryGetValue(currentDate.Date, out var attendanceRecord))
        //        {
        //            switch (attendanceRecord.Status)
        //            {
        //                case AttendanceStatus.Present:
        //                    payableDays += 1;
        //                    break;
        //                case AttendanceStatus.HalfDay:
        //                    payableDays += 0.5m;
        //                    lopDays += 0.5m;
        //                    break;
        //                case AttendanceStatus.Absent:
        //                    lopDays += 1;
        //                    break;
        //                case AttendanceStatus.OnLeave:
        //                    var coveringLeave = approvedLeaves.FirstOrDefault(l => currentDate.Date >= l.FromDate.Date && currentDate.Date <= l.ToDate.Date);
        //                    // Here we call our helper method to check the leave type by name.
        //                    if (coveringLeave != null && IsLeaveTypePaid(coveringLeave.LeaveType))
        //                    {
        //                        payableDays += 1;
        //                    }
        //                    else
        //                    {
        //                        lopDays += 1;
        //                    }
        //                    break;
        //            }
        //        }
        //        else // No attendance record found for a working day
        //        {
        //            var coveringLeave = approvedLeaves.FirstOrDefault(l => currentDate.Date >= l.FromDate.Date && currentDate.Date <= l.ToDate.Date);
        //            if (coveringLeave != null && IsLeaveTypePaid(coveringLeave.LeaveType))
        //            {
        //                payableDays += 1;
        //            }
        //            else
        //            {
        //                // No punch and no approved paid leave = LOP.
        //                lopDays += 1;
        //            }
        //        }
        //    }

        //    return (payableDays, lopDays);
        //}

        public async Task<AttendanceSummary> CalculateMonthlyAttendanceSummaryAsync(int employeeId, int year, int month)
        {
            var summary = new AttendanceSummary();

            var startDate = new DateTime(year, month, 1);
            var totalDaysInMonth = DateTime.DaysInMonth(year, month);
            var endDate = new DateTime(year, month, totalDaysInMonth);

            var attendanceRecords = await _context.Tbl_Attendance
                .Where(a => a.EmployeeID == employeeId &&
                            a.Date >= startDate &&
                            a.Date <= endDate &&
                            !a.IsDeleted)
                .ToDictionaryAsync(a => a.Date.Date);

            var approvedLeaves = await _context.Tb_LeaveRequests
                .Include(lr => lr.LeaveType)
                .Where(lr => lr.EmployeeID == employeeId &&
                             lr.Status == "Approved" &&
                             lr.FromDate <= endDate &&
                             lr.ToDate >= startDate &&
                             !lr.IsDeleted)
                .ToListAsync();

            var holidays = (await _context.Tbl_Holidays
                .Where(h => h.Date >= startDate && h.Date <= endDate)
                .Select(h => h.Date.Date)
                .ToListAsync())
                .ToHashSet();

            const DayOfWeek weeklyOff = DayOfWeek.Sunday;

            for (int i = 0; i < totalDaysInMonth; i++)
            {
                var currentDate = startDate.AddDays(i);

                if (holidays.Contains(currentDate.Date) || currentDate.DayOfWeek == weeklyOff)
                {
                    summary.PayableDays += 1;
                    summary.WeeklyOffAndHolidayDays += 1;
                    continue;
                }

                if (attendanceRecords.TryGetValue(currentDate.Date, out var attendanceRecord))
                {
                    switch (attendanceRecord.Status)
                    {
                        case AttendanceStatus.Present:
                            summary.PayableDays += 1;
                            summary.PresentDays += 1;
                            break;

                        case AttendanceStatus.HalfDay:
                            summary.PayableDays += 0.5m;
                            summary.PresentDays += 0.5m;
                            summary.LOPDays += 0.5m;
                            break;

                        case AttendanceStatus.Absent:
                            summary.LOPDays += 1;
                            break;

                        case AttendanceStatus.OnLeave:
                            var leave = approvedLeaves.FirstOrDefault(l =>
                                currentDate.Date >= l.FromDate.Date &&
                                currentDate.Date <= l.ToDate.Date);

                            if (leave != null && IsLeaveTypePaid(leave.LeaveType))
                            {
                                summary.PayableDays += 1;

                                if (leave.LeaveType.LeaveTypeName.Contains("Casual"))
                                    summary.CasualLeaveDays += 1;
                            }
                            else
                            {
                                summary.LOPDays += 1;
                            }
                            break;
                    }
                }
                else
                {
                    var leave = approvedLeaves.FirstOrDefault(l =>
                        currentDate.Date >= l.FromDate.Date &&
                        currentDate.Date <= l.ToDate.Date);

                    if (leave != null && IsLeaveTypePaid(leave.LeaveType))
                    {
                        summary.PayableDays += 1;
                    }
                    else
                    {
                        summary.LOPDays += 1;
                    }
                }
            }

            return summary;
        }

        public async Task<IEnumerable<PayrollHistoryDto>> GetPayrollHistoryAsync()
        {
            var payrollHistory = await _context.Tb_MonthlySalaryRecords
                .Where(msr => msr.PayrollRun.Status == "Completed")
                .GroupBy(msr => msr.PayrollRun) 
                .Select(g => new PayrollHistoryDto
                {
                    PayrollRunId = g.Key.Id,
                    Period = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                    Status = g.Key.Status,
                    ProcessedOn = g.Key.ProcessedDate,
                    Employees = g.Count(), 
                    GrossAmount = g.Sum(msr => msr.GrossEarnings),
                    NetAmount = g.Sum(msr => msr.NetSalary)
                })
                .OrderByDescending(dto => dto.ProcessedOn)
                .ToListAsync();

            return payrollHistory;
        }

        public async Task<PayrollDashboardDto> GetPayrollDashboardAsync(int year, int month)
        {
            var existingRun = await _context.Tb_PayrollRuns
                .FirstOrDefaultAsync(pr => pr.Year == year && pr.Month == month && pr.Status == "Completed");

            if (existingRun != null)
            {
                var historicalData = await _context.Tb_MonthlySalaryRecords
                    .Where(msr => msr.PayrollRunID == existingRun.Id)
                    .GroupBy(msr => 1) 
                    .Select(g => new
                    {
                        TotalEmployees = g.Count(),
                        GrossAmount = g.Sum(msr => msr.GrossEarnings)
                    })
                    .FirstOrDefaultAsync();

                return new PayrollDashboardDto
                {
                    ProcessingMonth = new DateTime(year, month, 1).ToString("MMMM yyyy"),
                    Status = "Completed",
                    TotalEmployees = historicalData?.TotalEmployees ?? 0,
                    EstimatedGrossAmount = historicalData?.GrossAmount ?? 0m
                };
            }
            else
            {
                var activeEmployeeCount = await _context.Employees
                    .CountAsync(e => e.IsActive && !e.IsDeleted);

                var estimatedGross = await _context.Tb_SalaryStructures
                    .Where(ss => ss.Employee.IsActive && !ss.Employee.IsDeleted &&
                                 ss.Status == "Active" &&
                                 ss.SalaryComponent.ComponentType == "Earning")
                    .SumAsync(ss => ss.Amount);

                return new PayrollDashboardDto
                {
                    ProcessingMonth = new DateTime(year, month, 1).ToString("MMMM yyyy"),
                    Status = "Ready",
                    TotalEmployees = activeEmployeeCount,
                    EstimatedGrossAmount = estimatedGross
                };
            }
        }

        public async Task<byte[]> GeneratePayrollRegisterExcelAsync(int runId)
        {
            var payrollRun = await _context.Tb_PayrollRuns.FindAsync(runId);
            if (payrollRun == null)
            {
                return null;
            }

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            var salaryRecords = await _context.Tb_MonthlySalaryRecords
                .Include(r => r.Employee)
                .Include(r => r.ComponentDetails)
                .Where(r => r.PayrollRunID == runId)
                .ToListAsync();



            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Payroll Register");

                // --- Create Headers ---
                var headers = new List<string> { "Emp Code", "Employee Name", "Payable Days", "Gross Earnings", "Total Deductions", "Net Salary" };

                // Get all unique earning and deduction component names to create dynamic columns
                var earningComponents = salaryRecords.SelectMany(r => r.ComponentDetails)
                                                     .Where(c => c.ComponentType == "Earning")
                                                     .Select(c => c.ComponentName).Distinct().OrderBy(name => name).ToList();
                var deductionComponents = salaryRecords.SelectMany(r => r.ComponentDetails)
                                                       .Where(c => c.ComponentType == "Deduction")
                                                       .Select(c => c.ComponentName).Distinct().OrderBy(name => name).ToList();

                headers.AddRange(earningComponents);
                headers.AddRange(deductionComponents);

                for (int i = 0; i < headers.Count; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                }

                // --- Fill Data Rows ---
                var row = 2;
                foreach (var record in salaryRecords)
                {
                    worksheet.Cells[row, 1].Value = record.Employee.EmployeeCode;
                    worksheet.Cells[row, 2].Value = record.Employee.FirstName + " " + record.Employee.LastName;
                    worksheet.Cells[row, 3].Value = record.PayableDays;
                    worksheet.Cells[row, 4].Value = record.GrossEarnings;
                    worksheet.Cells[row, 5].Value = record.TotalDeductions;
                    worksheet.Cells[row, 6].Value = record.NetSalary;

                    // Fill dynamic component columns
                    foreach (var componentName in earningComponents)
                    {
                        var component = record.ComponentDetails.FirstOrDefault(c => c.ComponentName == componentName);
                        worksheet.Cells[row, headers.IndexOf(componentName) + 1].Value = component?.Amount ?? 0;
                    }
                    foreach (var componentName in deductionComponents)
                    {
                        var component = record.ComponentDetails.FirstOrDefault(c => c.ComponentName == componentName);
                        worksheet.Cells[row, headers.IndexOf(componentName) + 1].Value = component?.Amount ?? 0;
                    }
                    row++;
                }

                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
                return await package.GetAsByteArrayAsync();
            }
        }

        public async Task<AttendanceCheckResultDto> GetAttendanceExceptionsAsync(int year, int month)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            var totalRecordsInMonth = await _context.Tbl_Attendance
            .CountAsync(a => a.Date >= startDate && a.Date <= endDate && !a.IsDeleted);

            // 1. Find employees with missing punch-outs
            var missingPunchOuts = await _context.Tbl_Attendance
                .Include(a => a.Employee)
                .Where(a => a.Date >= startDate && a.Date <= endDate &&
                            a.InTime != null && a.OutTime == null && !a.IsDeleted)
                .Select(a => new AttendanceExceptionDto
                {
                   // EmployeeID = a.EmployeeID,
                   EmployeeCode = a.Employee.EmployeeCode,
                    EmployeeName = a.Employee.FirstName + " " + a.Employee.LastName, // Assuming Employee has a Name property
                    Date = a.Date,
                    Issue = "Missing Punch-Out"
                }).ToListAsync();

            // 2. Find employees marked 'Absent' without an approved leave request on that day
            var absentees = await _context.Tbl_Attendance
                .Include(a => a.Employee)
                .Where(a => a.Date >= startDate && a.Date <= endDate &&
                            a.Status == AttendanceStatus.Absent && !a.IsDeleted)
                .ToListAsync();

            var exceptions = missingPunchOuts;
            foreach (var absentee in absentees)
            {
                bool hasApprovedLeave = await _context.Tb_LeaveRequests
                    .AnyAsync(lr => lr.EmployeeID == absentee.EmployeeID &&
                                    lr.Status == "Approved" && !lr.IsDeleted &&
                                    absentee.Date >= lr.FromDate && absentee.Date <= lr.ToDate);

                if (!hasApprovedLeave)
                {
                    exceptions.Add(new AttendanceExceptionDto
                    {
                        EmployeeID = absentee.EmployeeID,
                        EmployeeCode = absentee.Employee.EmployeeCode,
                        EmployeeName = absentee.Employee.FirstName + " " + absentee.Employee.LastName,
                        Date = absentee.Date,
                        Issue = "Absent without Approved Leave"
                    });
                }
            }

            return new AttendanceCheckResultDto
            {
                Exceptions = exceptions.OrderBy(e => e.Date).ThenBy(e => e.EmployeeName).ToList(),
                TotalAttendanceRecordsInMonth = totalRecordsInMonth
            };
        }

        public async Task<List<PendingLeaveRequestDto>> GetPendingLeaveRequestsAsync(int year, int month)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            return await _context.Tb_LeaveRequests
                .Include(lr => lr.Employee) // Assuming Employee has a ReportingManager navigation property
                .Include(lr => lr.LeaveType)
                .Where(lr => lr.Status == "Pending" && !lr.IsDeleted &&
                             ((lr.FromDate >= startDate && lr.FromDate <= endDate) ||
                              (lr.ToDate >= startDate && lr.ToDate <= endDate)))
                .Select(lr => new PendingLeaveRequestDto
                {
                    EmployeeID = lr.EmployeeID,
                    EmployeeName = lr.Employee.FirstName + " " + lr.Employee.LastName,
                    LeaveTypeName = lr.LeaveType.LeaveTypeName,
                    FromDate = lr.FromDate,
                    ToDate = lr.ToDate,
                    Days = lr.Days,
                    //ReportingManagerName = lr.Employee.ReportingManager.Name // Example of getting manager name
                }).ToListAsync();
        }

        public async Task<IEnumerable<object>> GetSalaryStructuresForReviewAsync()
        {
            var employeeQuery = _context.Employees
                                        .Where(e => e.IsActive && !e.IsDeleted);

            var employeesWithSalaries = await employeeQuery
                .Select(e => new {
                    EmployeeID = e.ID,
                    EmployeeCode = e.EmployeeCode,
                    FullName = e.FirstName + " " + e.LastName,
                    DateOfJoining = e.DateOfJoining, 
                    Department = e.Department.DepartmentName,   
                    Designation = e.Designation.DesignationName,
                    SalaryStructures = e.SalaryStructures
                        .Where(ss => !ss.IsDeleted
                                  && ss.Status == "Active"
                                  && ss.EffectiveDate <= DateTime.UtcNow)
                        .Select(ss => new {
                            ComponentName = ss.SalaryComponent.ComponentName,
                            Amount = ss.Amount,
                            EffectiveDate = ss.EffectiveDate,
                            Status = ss.Status
                        }).ToList()
                }).ToListAsync();

            return employeesWithSalaries;
        }

        public async Task<MonthlySalaryRecordDto?> GetMonthlySalaryRecordByIdAsync(int id)
        {
            var record = await _context.Tb_MonthlySalaryRecords
                .Include(msr => msr.Employee) // To get the Employee's name
                .Include(msr => msr.PayrollRun) // To get Year and Month
                .Include(msr => msr.ComponentDetails) // To get all components
                .FirstOrDefaultAsync(msr => msr.Id == id);

            if (record == null)
            {
                return null;
            }

            // Map the entity to the DTO
            return new MonthlySalaryRecordDto
            {
                Id = record.Id,
                EmployeeID = record.EmployeeID,
                EmployeeName = record.Employee?.FirstName + " "+ record.Employee?.LastName, // Assuming Employee has a FullName property
                Year = record.PayrollRun.Year,
                Month = record.PayrollRun.Month,
                PresentDays = record.PresentDays,
                WeeklyOffAndHolidays = record.WeeklyOffAndHolidays,
                CasualLeaveDays = record.CasualLeaveDays,
                PayableDays = record.PayableDays,
                LOPDays = record.LOPDays,
                GrossEarnings = record.GrossEarnings,
                TotalDeductions = record.TotalDeductions,
                NetSalary = record.NetSalary,
                Remarks = record.Remarks,
                ComponentDetails = record.ComponentDetails.Select(cd => new MonthlySalaryComponentDetailDto
                {
                    Id = cd.Id,
                    ComponentName = cd.ComponentName,
                    ComponentType = cd.ComponentType,
                    Amount = cd.Amount
                }).ToList()
            };
        }

        public async Task<bool> UpdateMonthlySalaryRecordAsync(int id, UpdateMonthlySalaryRecordDto updateDto)
        {
            // The rest of your C# code is correct and does not need to be changed.
            // It correctly fetches the full record and performs the recalculation on the server-side,
            // which is the most secure and reliable way to do it.

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var recordToUpdate = await _context.Tb_MonthlySalaryRecords
                    .Include(msr => msr.ComponentDetails)
                    .Include(msr => msr.Employee)
                        .ThenInclude(e => e.SalaryStructures)
                        .ThenInclude(ss => ss.SalaryComponent)
                    .FirstOrDefaultAsync(msr => msr.Id == id);

                if (recordToUpdate == null)
                {
                    return false;
                }

                recordToUpdate.PresentDays = updateDto.PresentDays;
                recordToUpdate.WeeklyOffAndHolidays = updateDto.WeeklyOffAndHolidays;
                recordToUpdate.CasualLeaveDays = updateDto.CasualLeaveDays;

                recordToUpdate.PayableDays = updateDto.PresentDays + updateDto.WeeklyOffAndHolidays + updateDto.CasualLeaveDays;

                recordToUpdate.LOPDays = recordToUpdate.TotalDaysInMonth - recordToUpdate.PayableDays;

                var totalDaysInMonth = recordToUpdate.TotalDaysInMonth;
                if (totalDaysInMonth <= 0)
                {
                    throw new InvalidOperationException("TotalDaysInMonth is not valid.");
                }

                var originalAmounts = recordToUpdate.Employee.SalaryStructures
                    .Where(ss => ss.Status == "Active" && !ss.IsDeleted && ss.SalaryComponent.ComponentType == "Earning")
                    .ToDictionary(ss => ss.SalaryComponent.ComponentName, ss => ss.Amount);

                // Recalculate pro-rated earnings
                foreach (var component in recordToUpdate.ComponentDetails.Where(c => c.ComponentType == "Earning"))
                {
                    if (originalAmounts.TryGetValue(component.ComponentName, out var originalAmount))
                    {
                        decimal proratedAmount = (originalAmount / totalDaysInMonth) * recordToUpdate.PayableDays;
                        component.Amount = Math.Round(proratedAmount, 2, MidpointRounding.AwayFromZero);
                    }
                }

                // Update deductions and other non-prorated components from the DTO
                foreach (var componentDto in updateDto.ComponentDetails)
                {
                    var componentToUpdate = recordToUpdate.ComponentDetails
                        .FirstOrDefault(c => c.Id == componentDto.Id);

                    if (componentToUpdate != null)
                    {
                        if (componentToUpdate.ComponentType == "Deduction" || !originalAmounts.ContainsKey(componentToUpdate.ComponentName))
                        {
                            componentToUpdate.Amount = componentDto.Amount;
                        }
                    }
                }

                // Recalculate totals
                recordToUpdate.GrossEarnings = recordToUpdate.ComponentDetails
                    .Where(c => c.ComponentType == "Earning")
                    .Sum(c => c.Amount);

                recordToUpdate.TotalDeductions = recordToUpdate.ComponentDetails
                    .Where(c => c.ComponentType == "Deduction")
                    .Sum(c => c.Amount);

                recordToUpdate.NetSalary = recordToUpdate.GrossEarnings - recordToUpdate.TotalDeductions;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<IEnumerable<SalaryRecordSummaryDto>> GetSalaryRecordsForRunAsync(int payrollRunId)
        {
            // Find all salary records for the given payroll run ID
            var records = await _context.Tb_MonthlySalaryRecords
                .Where(msr => msr.PayrollRunID == payrollRunId)
                .Include(msr => msr.Employee) // We need the Employee to get their name
                .Select(msr => new SalaryRecordSummaryDto
                {
                    Id = msr.Id,
                    EmployeeId = msr.EmployeeID,
                    // Make sure your Employee entity has a FullName property or adjust as needed
                    EmployeeName = msr.Employee.FirstName +" "+ msr.Employee.LastName,
                    NetSalary = msr.NetSalary
                })
                .OrderBy(e => e.EmployeeName) // Optional: sort by name
                .ToListAsync();

            return records;
        }

        public async Task<MonthlySalaryRecordForEditDto?> GetSalaryRecordForEditAsync(int recordId)
        {
            var record = await _context.Tb_MonthlySalaryRecords
                .Include(msr => msr.ComponentDetails)
                .Include(msr => msr.Employee)
                .FirstOrDefaultAsync(msr => msr.Id == recordId);

            if (record == null) return null;

            // ✅ SIMPLE NORMALIZE (SAFE)
            string Normalize(string name)
            {
                return name
                    .ToLower()
                    .Replace(".", "")
                    .Trim();
            }

            var salaryStructures = await _context.Tb_SalaryStructures
                 .Where(ss => ss.EmployeeID == record.EmployeeID && !ss.IsDeleted)
                 .Include(ss => ss.SalaryComponent)
                 .ToListAsync();   // 🔥 IMPORTANT

            // STEP 2: Now apply Normalize in memory
            var originalAmounts = salaryStructures
                .GroupBy(ss => Normalize(ss.SalaryComponent.ComponentName))
                .Select(g => g
                    .OrderByDescending(x => x.EffectiveDate ?? DateTime.MinValue)
                    .First()
                )
                .ToDictionary(
                    ss => Normalize(ss.SalaryComponent.ComponentName),
                    ss => ss.Amount
                );

            // ✅ STEP 2: MAP DTO
            var recordForEditDto = new MonthlySalaryRecordForEditDto
            {
                Id = record.Id,
                EmployeeName = $"{record.Employee.FirstName} {record.Employee.LastName}",
                PresentDays = record.PresentDays,
                WeeklyOffAndHolidays = record.WeeklyOffAndHolidays,
                CasualLeaveDays = record.CasualLeaveDays,
                PayableDays = record.PayableDays,
                LOPDays = record.LOPDays,
                Remarks = record.Remarks,
                TotalDaysInMonth = record.TotalDaysInMonth,

                ComponentDetails = record.ComponentDetails.Select(cd =>
                {
                    var key = Normalize(cd.ComponentName);

                    bool isProratedComponent =
                        cd.ComponentType == "Earning" &&
                        originalAmounts.ContainsKey(key);

                    return new MonthlySalaryComponentDetailForEditDto
                    {
                        Id = cd.Id,
                        ComponentName = cd.ComponentName,
                        ComponentType = cd.ComponentType,
                        Amount = cd.Amount,

                        // not used but keeping structure same
                        SalaryComponentId = 0,

                        IsProrated = isProratedComponent,

                        // ✅ FINAL FIX
                        OriginalMonthlyAmount = isProratedComponent
                            ? originalAmounts[key]
                            : (decimal?)null
                    };
                }).ToList()
            };

            return recordForEditDto;
        }
    }

    public class AttendanceSummary 
    {
            public decimal PayableDays { get; set; }
            public decimal LOPDays { get; set; }
            public decimal PresentDays { get; set; }
            public decimal WeeklyOffAndHolidayDays { get; set; }
            public decimal CasualLeaveDays { get; set; }
    }
}
