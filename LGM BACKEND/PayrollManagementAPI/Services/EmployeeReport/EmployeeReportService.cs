using Microsoft.EntityFrameworkCore;
using OfficeOpenXml.Style;
using OfficeOpenXml;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.EmployeeReports;
using System.Drawing;
using CompanyPlatform.Core.Models;

namespace PayrollManagementAPI.Services.EmployeeReport
{
    public class EmployeeReportService : IEmployeeReportService
    {
        private readonly ApplicationDBContext _context; // Assuming your DbContext is named ApplicationDbContext

        private readonly DayOfWeek WeeklyOffDay = DayOfWeek.Sunday;

        public EmployeeReportService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EmployeeMasterReportDto>> GenerateEmployeeMasterReportAsync()
        {
            return await _context.Employees
                .AsNoTracking()
                .Where(e => !e.IsDeleted)
                .Select(e => new EmployeeMasterReportDto
                {
                    EmployeeCode = e.EmployeeCode,
                    FullName = e.FirstName + " " + e.LastName,
                    EmailAddress = e.EmailAddress,
                    Department = e.Department.DepartmentName, // Assumes Department navigation property has a Name field
                    Designation = e.Designation.DesignationName, // Assumes Designation navigation property has a Name field
                    DateOfJoining = e.DateOfJoining,
                    IsActive = e.IsActive
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<HeadcountAnalysisDto>> GenerateHeadcountAnalysisAsync()
        {
            return await _context.Employees
                .AsNoTracking()
                .Where(e => !e.IsDeleted && e.IsActive)
                .GroupBy(e => new { e.DepartmentID, e.Department.DepartmentName })
                .Select(g => new HeadcountAnalysisDto
                {
                    Department = g.Key.DepartmentName,
                    EmployeeCount = g.Count()
                })
                .OrderByDescending(d => d.EmployeeCount)
                .ToListAsync();
        }

        public async Task<IEnumerable<AttendanceSummaryDto>> GenerateAttendanceSummaryAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Tbl_Attendance
                .AsNoTracking()
                .Where(a => !a.IsDeleted && a.Date >= startDate.Date && a.Date <= endDate.Date)
                .GroupBy(a => new { a.EmployeeID, a.Employee.EmployeeCode, a.Employee.FirstName, a.Employee.LastName })
                .Select(g => new AttendanceSummaryDto
                {
                    EmployeeCode = g.Key.EmployeeCode,
                    FullName = g.Key.FirstName + " " + g.Key.LastName,
                    PresentDays = g.Count(a => a.Status == AttendanceStatus.Present),
                    AbsentDays = g.Count(a => a.Status == AttendanceStatus.Absent),
                    HalfDays = g.Count(a => a.Status == AttendanceStatus.HalfDay),
                    OnLeaveDays = g.Count(a => a.Status == AttendanceStatus.OnLeave)
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<LeaveBalanceReportDto>> GenerateLeaveBalanceReportAsync(int financialYear)
        {
            var financialYearStartDate = new DateTime(financialYear, 4, 1);
            var financialYearEndDate = financialYearStartDate.AddYears(1).AddDays(-1);

            var availedLeaves = await _context.Tb_LeaveRequests
                .AsNoTracking()
                .Where(lr =>
                    lr.Status == "Approved" &&
                    !lr.IsDeleted &&
                    lr.FromDate >= financialYearStartDate &&
                    lr.FromDate <= financialYearEndDate
                )
                .GroupBy(lr => new { lr.EmployeeID, lr.LeaveTypeID })
                .Select(g => new
                {
                    g.Key.EmployeeID,
                    g.Key.LeaveTypeID,
                    AvailedDays = g.Sum(l => l.Days)
                })
                .ToListAsync();


            var allAssignedLeaves = await _context.Tb_AssignLeaveTypes
                .AsNoTracking()
                .Include(al => al.Employee)  // Eager load Employee data
                .Include(al => al.LeaveType) // Eager load LeaveType data
                .Where(al => al.FinancialYear == financialYear && !al.IsDeleted)
                .ToListAsync();

            var leaveBalances = allAssignedLeaves
                .GroupJoin(
                    availedLeaves,
                    assigned => new { assigned.EmployeeID, assigned.LeaveTypeID },
                    availed => new { availed.EmployeeID, availed.LeaveTypeID },
                    (assigned, availedGroup) => new { assigned, availedGroup }
                )
                .SelectMany(
                    x => x.availedGroup.DefaultIfEmpty(),
                    (x, availed) => new LeaveBalanceReportDto
                    {
                        EmployeeCode = x.assigned.Employee.EmployeeCode,
                        FullName = x.assigned.Employee.FirstName + " " + x.assigned.Employee.LastName,
                        LeaveType = x.assigned.LeaveType.LeaveTypeName,
                        AllocatedDays = x.assigned.AllocatedDays,
                        AvailedDays = availed?.AvailedDays ?? 0, // Simplified null check
                        BalanceDays = x.assigned.AllocatedDays - (availed?.AvailedDays ?? 0)
                    }
                )
                .OrderBy(lb => lb.FullName)
                .ThenBy(lb => lb.LeaveType)
                .ToList(); // Use .ToList() for in-memory operations

            // --- END OF FIX ---

            return leaveBalances;
        }

        public async Task<IEnumerable<DepartmentWiseAnalysisDto>> GenerateDepartmentWiseAnalysisAsync()
        {
            return await _context.Employees
                .AsNoTracking()
                .Where(e => !e.IsDeleted && e.IsActive)
                .GroupBy(e => new { e.DepartmentID, e.Department.DepartmentName })
                .Select(g => new DepartmentWiseAnalysisDto
                {
                    Department = g.Key.DepartmentName,
                    TotalEmployees = g.Count()
                })
                .OrderBy(d => d.Department)
                .ToListAsync();
        }

        public async Task<byte[]> GenerateEmployeeMasterReportExcelAsync()
        {
            var reportData = await GenerateEmployeeMasterReportAsync();

            ExcelPackage.License.SetNonCommercialOrganization("CompanyPlatform");

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Employee Master");

                var headers = new string[] {
                    "Employee Code", "Full Name", "Email Address", "Department",
                    "Designation", "Date of Joining", "Status"
                };

                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                }

                using (var range = worksheet.Cells[1, 1, 1, headers.Length])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                // 3. Add the data rows, starting from row 2
                var currentRow = 2;
                foreach (var item in reportData)
                {
                    worksheet.Cells[currentRow, 1].Value = item.EmployeeCode;
                    worksheet.Cells[currentRow, 2].Value = item.FullName;
                    worksheet.Cells[currentRow, 3].Value = item.EmailAddress;
                    worksheet.Cells[currentRow, 4].Value = item.Department;
                    worksheet.Cells[currentRow, 5].Value = item.Designation;
                    worksheet.Cells[currentRow, 6].Value = item.DateOfJoining;
                    worksheet.Cells[currentRow, 6].Style.Numberformat.Format = "dd-MMM-yyyy"; // Apply Excel date format
                    worksheet.Cells[currentRow, 7].Value = item.IsActive ? "Active" : "Inactive";
                    currentRow++;
                }

                // 4. Adjust column widths to content
                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                // 5. Save the workbook and return it as a byte array
                return await package.GetAsByteArrayAsync();
            }
        }

        public async Task<byte[]> GenerateAttendanceSummaryExcelAsync(DateTime startDate, DateTime endDate)
        {
            var reportData = await GenerateAttendanceSummaryAsync(startDate, endDate);

            ExcelPackage.License.SetNonCommercialOrganization("CompanyPlatform");

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Attendance Summary");

                var headers = new string[] { "Employee Code", "Full Name", "Present Days", "Absent Days", "Half Days", "On Leave Days" };
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                }

                using (var range = worksheet.Cells[1, 1, 1, headers.Length])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                var currentRow = 2;
                foreach (var item in reportData)
                {
                    worksheet.Cells[currentRow, 1].Value = item.EmployeeCode;
                    worksheet.Cells[currentRow, 2].Value = item.FullName;
                    worksheet.Cells[currentRow, 3].Value = item.PresentDays;
                    worksheet.Cells[currentRow, 4].Value = item.AbsentDays;
                    worksheet.Cells[currentRow, 5].Value = item.HalfDays;
                    worksheet.Cells[currentRow, 6].Value = item.OnLeaveDays;
                    currentRow++;
                }

                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
                return await package.GetAsByteArrayAsync();
            }
        }

        // --- *** NEW METHOD 2: LEAVE BALANCE EXCEL *** ---
        public async Task<byte[]> GenerateLeaveBalanceReportExcelAsync(int financialYear)
        {
            var reportData = await GenerateLeaveBalanceReportAsync(financialYear);

            ExcelPackage.License.SetNonCommercialOrganization("CompanyPlatform");

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Leave Balance Report");

                var headers = new string[] { "Employee Code", "Full Name", "Leave Type", "Allocated Days", "Availed Days", "Balance Days" };
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                }

                using (var range = worksheet.Cells[1, 1, 1, headers.Length])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                var currentRow = 2;
                foreach (var item in reportData)
                {
                    worksheet.Cells[currentRow, 1].Value = item.EmployeeCode;
                    worksheet.Cells[currentRow, 2].Value = item.FullName;
                    worksheet.Cells[currentRow, 3].Value = item.LeaveType;
                    worksheet.Cells[currentRow, 4].Value = item.AllocatedDays;
                    worksheet.Cells[currentRow, 5].Value = item.AvailedDays;
                    worksheet.Cells[currentRow, 6].Value = item.BalanceDays;
                    currentRow++;
                }

                // Apply number formatting to the day columns
                worksheet.Cells[2, 4, currentRow - 1, 6].Style.Numberformat.Format = "0.00";

                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
                return await package.GetAsByteArrayAsync();
            }
        }

        public async Task<IEnumerable<MonthlySalaryRegisterDto>> GenerateMonthlySalaryRegisterAsync(int month, int year)
        {
            var payrollRun = await _context.Tb_PayrollRuns
                .FirstOrDefaultAsync(pr => pr.Month == month && pr.Year == year);

            if (payrollRun == null) return new List<MonthlySalaryRegisterDto>();

            var salaryRecords = await _context.Tb_MonthlySalaryRecords
                .Include(r => r.Employee).ThenInclude(e => e.Department)
                .Include(r => r.ComponentDetails)
                .Where(r => r.PayrollRunID == payrollRun.Id)
                .ToListAsync();

            var report = salaryRecords.Select(r => new MonthlySalaryRegisterDto
            {
                EmployeeCode = r.Employee.EmployeeCode,
                FullName = $"{r.Employee.FirstName} {r.Employee.LastName}",
                Department = r.Employee.Department?.DepartmentName ?? "N/A",
                PayableDays = r.PayableDays,
                LOPDays = r.LOPDays,
                GrossEarnings = r.GrossEarnings,
                TotalDeductions = r.TotalDeductions,
                NetSalary = r.NetSalary,
                Earnings = r.ComponentDetails.Where(c => c.ComponentType == "Earning")
                                .ToDictionary(c => c.ComponentName, c => c.Amount),
                Deductions = r.ComponentDetails.Where(c => c.ComponentType == "Deduction")
                                .ToDictionary(c => c.ComponentName, c => c.Amount)
            }).ToList();

            return report;
        }

        public async Task<IEnumerable<CostCenterAnalysisDto>> GenerateCostCenterAnalysisAsync(int month, int year)
        {
            var payrollRun = await _context.Tb_PayrollRuns
                .FirstOrDefaultAsync(pr => pr.Month == month && pr.Year == year);

            if (payrollRun == null) return new List<CostCenterAnalysisDto>();

            return await _context.Tb_MonthlySalaryRecords
                .Where(r => r.PayrollRunID == payrollRun.Id)
                .Include(r => r.Employee).ThenInclude(e => e.Department)
                .GroupBy(r => r.Employee.Department.DepartmentName)
                .Select(g => new CostCenterAnalysisDto
                {
                    Department = g.Key,
                    TotalCost = g.Sum(r => r.GrossEarnings),
                    EmployeeCount = g.Count()
                })
                .OrderByDescending(d => d.TotalCost)
                .ToListAsync();
        }



        public async Task<IEnumerable<BonusIncentiveReportDto>> GenerateBonusReportAsync(string financialYear)
        {
            var queryYear = financialYear;

            if (!string.IsNullOrEmpty(financialYear) && financialYear.Contains('-'))
            {
                var parts = financialYear.Split('-');
                if (parts.Length == 2 && parts[1].Length == 2)
                {
                    queryYear = $"{parts[0]}-{parts[0].Substring(0, 2)}{parts[1]}";
                }
            }

            return await _context.Tbl_BonusRecords
                .Where(b => b.FinancialYear == queryYear)
                .Include(b => b.Employee)
                .Select(b => new BonusIncentiveReportDto
                {
                    EmployeeCode = b.Employee.EmployeeCode,
                    FullName = b.Employee.FirstName + " " + b.Employee.LastName,
                    FinancialYear = b.FinancialYear, // Return the value from DB
                    BonusAmount = b.BonusAmount,
                    Status = b.Status
                })
                .ToListAsync();

        }

        // In your PayrollReportService.cs (or consolidated reports service file)

        public async Task<IEnumerable<BankTransferSummaryDto>> GenerateBankTransferSummaryAsync(int month, int year)
        {
            var payrollRun = await _context.Tb_PayrollRuns
                .FirstOrDefaultAsync(pr => pr.Month == month && pr.Year == year);

            if (payrollRun == null)
                return new List<BankTransferSummaryDto>();


            var result = await (
                from salary in _context.Tb_MonthlySalaryRecords
                join emp in _context.Employees
                    on salary.EmployeeID equals emp.ID
                join bank in _context.EmployeeBankDetails
                    on emp.ID equals bank.EmployeeID into bankDetailsGroup
                from bank in bankDetailsGroup.DefaultIfEmpty()
                where salary.PayrollRunID == payrollRun.Id
                      && salary.NetSalary > 0
                      && (bank == null || bank.IsDeleted == false)
                select new BankTransferSummaryDto
                {
                    EmployeeCode = emp.EmployeeCode,
                    FullName = emp.FirstName + " " + emp.LastName,
                    NetSalary = salary.NetSalary,
                    BankName = bank != null ? bank.BankName : "N/A",
                    AccountNumber = bank != null ? bank.AccountNumber : "N/A",
                    IFSCCode = bank != null ? bank.IFSCCode : "N/A"
                }
            ).ToListAsync();


            return result;
        }

        public async Task<byte[]> GenerateMonthlySalaryRegisterExcelAsync(int month, int year)
        {
            var reportData = await GenerateMonthlySalaryRegisterAsync(month, year);

            ExcelPackage.License.SetNonCommercialOrganization("CompanyPlatform");

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Monthly Salary Register");

                // Dynamically determine all earning and deduction headers
                var earningsHeaders = reportData.SelectMany(r => r.Earnings.Keys).Distinct().OrderBy(h => h).ToList();
                var deductionsHeaders = reportData.SelectMany(r => r.Deductions.Keys).Distinct().OrderBy(h => h).ToList();

                // Create the full header list
                var headers = new List<string> { "Employee Code", "Full Name", "Department", "Payable Days", "LOP Days" };
                headers.AddRange(earningsHeaders);
                headers.Add("Gross Earnings");
                headers.AddRange(deductionsHeaders);
                headers.Add("Total Deductions");
                headers.Add("Net Salary");

                // Write headers to the worksheet
                for (int i = 0; i < headers.Count; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                }

                // Style header row
                using (var range = worksheet.Cells[1, 1, 1, headers.Count])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                }

                // Add data rows
                var currentRow = 2;
                foreach (var item in reportData)
                {
                    int col = 1;
                    worksheet.Cells[currentRow, col++].Value = item.EmployeeCode;
                    worksheet.Cells[currentRow, col++].Value = item.FullName;
                    worksheet.Cells[currentRow, col++].Value = item.Department;
                    worksheet.Cells[currentRow, col++].Value = item.PayableDays;
                    worksheet.Cells[currentRow, col++].Value = item.LOPDays;

                    foreach (var header in earningsHeaders)
                    {
                        worksheet.Cells[currentRow, col++].Value = item.Earnings.TryGetValue(header, out var value) ? value : 0;
                    }
                    worksheet.Cells[currentRow, col++].Value = item.GrossEarnings;

                    foreach (var header in deductionsHeaders)
                    {
                        worksheet.Cells[currentRow, col++].Value = item.Deductions.TryGetValue(header, out var value) ? value : 0;
                    }
                    worksheet.Cells[currentRow, col++].Value = item.TotalDeductions;
                    worksheet.Cells[currentRow, col++].Value = item.NetSalary;

                    currentRow++;
                }

                // Apply number format to currency columns
                int firstCurrencyCol = 5 + earningsHeaders.Count + 1; // After LOP Days and all earnings
                worksheet.Cells[2, firstCurrencyCol, currentRow - 1, headers.Count].Style.Numberformat.Format = "#,##0.00";


                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
                return await package.GetAsByteArrayAsync();
            }
        }

        // --- NEW METHOD 2: BONUS & INCENTIVE EXCEL ---
        public async Task<byte[]> GenerateBonusReportExcelAsync(string financialYear)
        {
            var reportData = await GenerateBonusReportAsync(financialYear);

            ExcelPackage.License.SetNonCommercialOrganization("CompanyPlatform");

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Bonus Report");
                var headers = new string[] { "Employee Code", "Full Name", "Financial Year", "Status", "Bonus Amount" };

                // Write and style headers
                for (int i = 0; i < headers.Length; i++) { worksheet.Cells[1, i + 1].Value = headers[i]; }
                using (var range = worksheet.Cells[1, 1, 1, headers.Length]) { range.Style.Font.Bold = true; range.Style.Fill.PatternType = ExcelFillStyle.Solid; range.Style.Fill.BackgroundColor.SetColor(Color.LightGray); }

                // Add data rows
                var currentRow = 2;
                foreach (var item in reportData)
                {
                    worksheet.Cells[currentRow, 1].Value = item.EmployeeCode;
                    worksheet.Cells[currentRow, 2].Value = item.FullName;
                    worksheet.Cells[currentRow, 3].Value = item.FinancialYear;
                    worksheet.Cells[currentRow, 4].Value = item.Status;
                    worksheet.Cells[currentRow, 5].Value = item.BonusAmount;
                    currentRow++;
                }

                worksheet.Cells[2, 5, currentRow - 1, 5].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
                return await package.GetAsByteArrayAsync();
            }
        }

        // --- NEW METHOD 3: BANK TRANSFER SUMMARY EXCEL ---
        public async Task<byte[]> GenerateBankTransferSummaryExcelAsync(int month, int year)
        {
            var reportData = await GenerateBankTransferSummaryAsync(month, year);

            ExcelPackage.License.SetNonCommercialOrganization("CompanyPlatform");

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Bank Transfer Summary");
                var headers = new string[] { "Employee Code", "Full Name", "Bank Name", "Account Number", "IFSC Code", "Net Salary" };

                for (int i = 0; i < headers.Length; i++) { worksheet.Cells[1, i + 1].Value = headers[i]; }
                using (var range = worksheet.Cells[1, 1, 1, headers.Length]) { range.Style.Font.Bold = true; range.Style.Fill.PatternType = ExcelFillStyle.Solid; range.Style.Fill.BackgroundColor.SetColor(Color.LightGray); }

                var currentRow = 2;
                foreach (var item in reportData)
                {
                    worksheet.Cells[currentRow, 1].Value = item.EmployeeCode;
                    worksheet.Cells[currentRow, 2].Value = item.FullName;
                    worksheet.Cells[currentRow, 3].Value = item.BankName;
                    worksheet.Cells[currentRow, 4].Value = item.AccountNumber;
                    worksheet.Cells[currentRow, 5].Value = item.IFSCCode;
                    worksheet.Cells[currentRow, 6].Value = item.NetSalary;
                    currentRow++;
                }

                worksheet.Cells[2, 6, currentRow - 1, 6].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
                return await package.GetAsByteArrayAsync();
            }

        }

        public async Task<IEnumerable<EmployerPfReportDto>> GenerateEmployerPfReportAsync(int month, int year)
        {
            var payrollRun = await _context.Tb_PayrollRuns
                .AsNoTracking()
                .FirstOrDefaultAsync(pr => pr.Month == month && pr.Year == year);

            if (payrollRun == null)
            {
                return new List<EmployerPfReportDto>();
            }

            return await _context.Tb_MonthlySalaryRecords
                .AsNoTracking()
                .Where(r => r.PayrollRunID == payrollRun.Id && r.EmployerPF > 0)
                .Include(r => r.Employee)
                    .ThenInclude(e => e.Department)
                .Select(r => new EmployerPfReportDto
                {
                    EmployeeCode = r.Employee.EmployeeCode,
                    FullName = r.Employee.FirstName + " " + r.Employee.LastName,
                    Department = r.Employee.Department.DepartmentName ?? "N/A",
                    GrossEarnings = r.GrossEarnings,
                    EmployerPF = r.EmployerPF
                })
                .OrderBy(r => r.FullName)
                .ToListAsync();
        }

        public async Task<byte[]> GenerateEmployerPfReportExcelAsync(int month, int year)
        {
            var reportData = await GenerateEmployerPfReportAsync(month, year);

            ExcelPackage.License.SetNonCommercialOrganization("CompanyPlatform");

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Employer PF Report");
                var headers = new string[] { "Employee Code", "Full Name", "Department", "Gross Earnings", "Employer PF Contribution" };

                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                }
                using (var range = worksheet.Cells[1, 1, 1, headers.Length])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                }

                var currentRow = 2;
                foreach (var item in reportData)
                {
                    worksheet.Cells[currentRow, 1].Value = item.EmployeeCode;
                    worksheet.Cells[currentRow, 2].Value = item.FullName;
                    worksheet.Cells[currentRow, 3].Value = item.Department;
                    worksheet.Cells[currentRow, 4].Value = item.GrossEarnings;
                    worksheet.Cells[currentRow, 5].Value = item.EmployerPF;
                    currentRow++;
                }

                worksheet.Cells[2, 4, currentRow - 1, 5].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
                return await package.GetAsByteArrayAsync();
            }
        }

        public async Task<List<DetailedAttendanceReportDto>> GenerateDetailedAttendanceReportAsync(int month, int year, int? employeeId = null)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);
            var daysInMonth = DateTime.DaysInMonth(year, month);

            var employeesQuery = _context.Employees
               .Where(e => e.IsActive && !e.IsDeleted);

            if (employeeId.HasValue)
            {
                employeesQuery = employeesQuery.Where(e => e.ID == employeeId.Value);
            }

            var attendances = await _context.Tbl_Attendance
                .Where(a =>
                    !a.IsDeleted &&
                    a.Date >= startDate &&
                    a.Date <= endDate)
                .ToListAsync();

            var attendanceLookup = attendances
             .GroupBy(a => a.EmployeeID)
             .ToDictionary(g => g.Key, g => g.ToList());

            var outdoorDuties = await _context.Tbl_OutdoorDuties
                .Where(od =>
                    !od.IsDeleted &&
                    od.Status == "Approved" &&
                    od.FromDate <= endDate &&
                    od.ToDate >= startDate)
                .ToListAsync();

            var outdoorDutyLookup = outdoorDuties
               .GroupBy(od => od.EmployeeID)
               .ToDictionary(g => g.Key, g => g.ToList());

            var holidays = await _context.Tbl_Holidays
                .Where(h =>
                    !h.IsDeleted &&
                    h.Date >= startDate &&
                    h.Date <= endDate)
                .ToListAsync();

            var holidayLookup = holidays
              .ToDictionary(h => h.Date.Date, h => h);

            var reportData = new List<DetailedAttendanceReportDto>();

            foreach (var employee in employeesQuery)
            {
                attendanceLookup.TryGetValue(employee.ID, out var employeeAttendances);

                outdoorDutyLookup.TryGetValue(employee.ID, out var employeeODs);

                var employeeReport = new DetailedAttendanceReportDto
                {
                    EmployeeCode = employee.EmployeeCode,
                    EmployeeName = $"{employee.FirstName} {employee.LastName}".Trim(),
                    DailyRecords = new List<DailyAttendanceRecordDto>()
                };

                for (int day = 1; day <= daysInMonth; day++)
                {
                    var currentDate = new DateTime(year, month, day);

                    var attendance = employeeAttendances?
                        .FirstOrDefault(a => a.Date.Date == currentDate.Date);

                    var isOnOutdoorDuty = employeeODs != null &&
                     employeeODs.Any(od =>
                     currentDate.Date >= od.FromDate.Date &&
                     currentDate.Date <= od.ToDate.Date);

                    var isHoliday = holidayLookup.ContainsKey(currentDate.Date);

                    var dailyDto = new DailyAttendanceRecordDto
                    {
                        DayOfMonth = day,
                        InTime = "",
                        OutTime = "",
                        TotalHours = "00:00"
                    };

                    if (isOnOutdoorDuty)
                    {
                        dailyDto.Status = "OD";

                        // ✅ ADD THIS: Show time if attendance exists
                        if (attendance != null)
                        {
                            dailyDto.InTime = attendance.InTime?.ToString("HH:mm") ?? "";
                            dailyDto.OutTime = attendance.OutTime?.ToString("HH:mm") ?? "";

                            if (attendance.InTime.HasValue && attendance.OutTime.HasValue)
                            {
                                var duration = attendance.OutTime.Value - attendance.InTime.Value;
                                dailyDto.TotalHours =
                                    $"{(int)duration.TotalHours:D2}:{duration.Minutes:D2}";
                            }
                        }
                    }
                    else if (isHoliday)
                    {
                        dailyDto.Status = "H";
                    }
                    else if (attendance != null)
                    {
                        dailyDto.Status = GetStatusString(attendance.Status);
                        dailyDto.InTime = attendance.InTime?.ToString("HH:mm") ?? "";
                        dailyDto.OutTime = attendance.OutTime?.ToString("HH:mm") ?? "";

                        if (attendance.InTime.HasValue && attendance.OutTime.HasValue)
                        {
                            var duration = attendance.OutTime.Value - attendance.InTime.Value;
                            dailyDto.TotalHours =
                                $"{(int)duration.TotalHours:D2}:{duration.Minutes:D2}";
                        }
                    }
                    else
                    {
                        if (currentDate.DayOfWeek == WeeklyOffDay)
                        {
                            dailyDto.Status = "WO";
                        }
                        else
                        {
                            dailyDto.Status = "A";
                        }
                    }

                    employeeReport.DailyRecords.Add(dailyDto);
                }

                reportData.Add(employeeReport);
            }

            return reportData;
        }

        private string GetStatusString(AttendanceStatus status)
        {
            return status switch
            {
                AttendanceStatus.Present => "P",
                AttendanceStatus.Absent => "A",
                AttendanceStatus.HalfDay => "HD",
                AttendanceStatus.OnLeave => "CL",
                _ => ""
            };
        }

        public async Task<IEnumerable<ExpenseClaimReportDto>> GenerateExpenseClaimReportAsync(DateTime startDate, DateTime endDate, string? status)
        {
            var query = _context.Tbl_ExpenseClaims
                .AsNoTracking()
                .Where(ec => !ec.IsDeleted && ec.ClaimDate.Date >= startDate.Date && ec.ClaimDate.Date <= endDate.Date);

            if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
            {
                query = query.Where(ec => ec.Status.ToLower() == status.ToLower());
            }

            return await query
                .Include(ec => ec.Employee)
                .Include(ec => ec.ExpenseType)
                .Include(ec => ec.Approver) // Approver can be null, EF Core handles this
                .Select(ec => new ExpenseClaimReportDto
                {
                    EmployeeCode = ec.Employee.EmployeeCode,
                    EmployeeName = ec.Employee.FirstName + " " + ec.Employee.LastName,
                    ExpenseType = ec.ExpenseType.ExpenseTypeName,
                    ClaimDate = ec.ClaimDate,
                    Amount = ec.Amount,
                    Status = ec.Status,
                    ApprovedAmount = ec.ApprovedAmount,
                    ApproverName = ec.Approver != null ? ec.Approver.FirstName + " " + ec.Approver.LastName : "N/A",
                    ApprovalDate = ec.ApprovalDate,
                    Description = ec.Description
                })
                .OrderByDescending(r => r.ClaimDate)
                .ToListAsync();
        }

        public async Task<byte[]> GenerateExpenseClaimReportExcelAsync(DateTime startDate, DateTime endDate, string? status)
        {
            var reportData = await GenerateExpenseClaimReportAsync(startDate, endDate, status);

            ExcelPackage.License.SetNonCommercialOrganization("CompanyPlatform");

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Expense Claim Report");
                var headers = new string[] {
            "Employee Code", "Employee Name", "Expense Type", "Claim Date", "Amount",
            "Status", "Approved Amount", "Approver Name", "Approval Date", "Description"
        };

                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                }

                using (var range = worksheet.Cells[1, 1, 1, headers.Length])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                }

                var currentRow = 2;
                foreach (var item in reportData)
                {
                    worksheet.Cells[currentRow, 1].Value = item.EmployeeCode;
                    worksheet.Cells[currentRow, 2].Value = item.EmployeeName;
                    worksheet.Cells[currentRow, 3].Value = item.ExpenseType;
                    worksheet.Cells[currentRow, 4].Value = item.ClaimDate;
                    worksheet.Cells[currentRow, 5].Value = item.Amount;
                    worksheet.Cells[currentRow, 6].Value = item.Status;
                    worksheet.Cells[currentRow, 7].Value = item.ApprovedAmount;
                    worksheet.Cells[currentRow, 8].Value = item.ApproverName;
                    worksheet.Cells[currentRow, 9].Value = item.ApprovalDate;
                    worksheet.Cells[currentRow, 10].Value = item.Description;
                    currentRow++;
                }

                // Formatting
                worksheet.Cells[2, 4, currentRow, 4].Style.Numberformat.Format = "dd-mmm-yyyy";
                worksheet.Cells[2, 9, currentRow, 9].Style.Numberformat.Format = "dd-mmm-yyyy";
                worksheet.Cells[2, 5, currentRow, 5].Style.Numberformat.Format = "#,##0.00";
                worksheet.Cells[2, 7, currentRow, 7].Style.Numberformat.Format = "#,##0.00";

                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
                return await package.GetAsByteArrayAsync();
            }
        }

        //public async Task<IEnumerable<LeaveEncashmentReportDto>> GenerateLeaveEncashmentReportAsync(int financialYear)
        //{
        //    return await _context.Tbl_LeaveEncashments
        //        .AsNoTracking()
        //        .Include(le => le.Employee).ThenInclude(e => e.Designation)
        //        .Where(le => le.FinancialYear == financialYear)
        //        .Select(le => new LeaveEncashmentReportDto
        //        {
        //            EmployeeCode = le.Employee.EmployeeCode,
        //            FullName = le.Employee.FirstName + " " + le.Employee.LastName,
        //            Designation = le.Employee.Designation.DesignationName ?? "N/A",
        //            FinancialYear = le.FinancialYear,
        //            GrossSalary = le.GrossSalary,
        //            RatePerDay = le.RateOfELEncashment,
        //            TotalEarnedLeaves = le.TotalEarnedLeaves,
        //            LeavesTaken = le.LeavesTaken,
        //            BalanceToEncash = le.RemainingLeavesForEncashment,
        //            TotalEncashmentAmount = le.TotalAmountOfELEncashment,
        //            PaymentDate = le.DateOfPayment,
        //            Status = le.Status
        //        })
        //        .OrderBy(x => x.FullName)
        //        .ToListAsync();
        //}

        // 2. Logic to Generate Excel
        //public async Task<byte[]> GenerateLeaveEncashmentReportExcelAsync(int financialYear)
        //{
        //    var reportData = await GenerateLeaveEncashmentReportAsync(financialYear);

        //    ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        //    using (var package = new ExcelPackage())
        //    {
        //        var worksheet = package.Workbook.Worksheets.Add("Leave Encashment");

        //        var headers = new string[] {
        //    "Employee Code", "Full Name", "Designation", "Financial Year",
        //    "Gross Salary", "Rate/Day", "Total EL", "Taken", "Balance",
        //    "Encashment Amount", "Payment Date", "Status"
        //    };

        //        // Write Headers
        //        for (int i = 0; i < headers.Length; i++)
        //        {
        //            worksheet.Cells[1, i + 1].Value = headers[i];
        //        }

        //        // Style Headers
        //        using (var range = worksheet.Cells[1, 1, 1, headers.Length])
        //        {
        //            range.Style.Font.Bold = true;
        //            range.Style.Fill.PatternType = ExcelFillStyle.Solid;
        //            range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
        //            range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        //        }

        //        // Write Data
        //        var currentRow = 2;
        //        foreach (var item in reportData)
        //        {
        //            worksheet.Cells[currentRow, 1].Value = item.EmployeeCode;
        //            worksheet.Cells[currentRow, 2].Value = item.FullName;
        //            worksheet.Cells[currentRow, 3].Value = item.Designation;
        //            worksheet.Cells[currentRow, 4].Value = item.FinancialYear;
        //            worksheet.Cells[currentRow, 5].Value = item.GrossSalary;
        //            worksheet.Cells[currentRow, 6].Value = item.RatePerDay;
        //            worksheet.Cells[currentRow, 7].Value = item.TotalEarnedLeaves;
        //            worksheet.Cells[currentRow, 8].Value = item.LeavesTaken;
        //            worksheet.Cells[currentRow, 9].Value = item.BalanceToEncash;
        //            worksheet.Cells[currentRow, 10].Value = item.TotalEncashmentAmount;
        //            worksheet.Cells[currentRow, 11].Value = item.PaymentDate.ToString("dd-MMM-yyyy");
        //            worksheet.Cells[currentRow, 12].Value = item.Status;
        //            currentRow++;
        //        }

        //        // Format Currency Columns
        //        worksheet.Cells[2, 5, currentRow - 1, 6].Style.Numberformat.Format = "#,##0.00"; // Gross & Rate
        //        worksheet.Cells[2, 10, currentRow - 1, 10].Style.Numberformat.Format = "#,##0.00"; // Amount

        //        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
        //        return await package.GetAsByteArrayAsync();
        //    }
        //}
    }
}
