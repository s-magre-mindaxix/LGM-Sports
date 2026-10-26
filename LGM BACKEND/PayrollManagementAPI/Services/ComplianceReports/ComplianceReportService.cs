using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using System.Text;
using OfficeOpenXml;
using OfficeOpenXml.Style; 
using System.Drawing; // Needed for colors
using System.Linq;

namespace PayrollManagementAPI.Services.ComplianceReports
{
    public class ComplianceReportService : IComplianceReportService
    {
        private readonly ApplicationDBContext _context;

        public ComplianceReportService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<byte[]> GeneratePfEcrFileAsync(int payrollRunId)
        {
            var recordsWithDetails = await _context.Tb_MonthlySalaryRecords
                .Include(r => r.Employee)
                .Include(r => r.ComponentDetails)
                .Where(r => r.PayrollRunID == payrollRunId)
                .Select(r => new
                {
                    Record = r,
                    StatutoryDetails = _context.Tb_EmployeeStatutoryDetails
                                               .FirstOrDefault(s => s.EmployeeID == r.EmployeeID && !s.IsDeleted)
                })
                .ToListAsync();

            var employeesWithPF = recordsWithDetails
                .Where(item => (item.Record.ComponentDetails.FirstOrDefault(c => c.ComponentName == "P. F.")?.Amount ?? 0) > 0)
                .ToList();

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("PF ECR Report");

                // --- Report Title and Metadata ---
                worksheet.Cells["A1:G1"].Merge = true;
                worksheet.Cells["A1"].Value = "Provident Fund (PF) ECR Report";
                worksheet.Cells["A1"].Style.Font.Bold = true;
                worksheet.Cells["A1"].Style.Font.Size = 16;
                worksheet.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                worksheet.Cells["A2:G2"].Merge = true;
                worksheet.Cells["A2"].Value = $"Generated on: {DateTime.Now:dd-MMM-yyyy HH:mm}";
                worksheet.Cells["A2"].Style.Font.Italic = true;
                worksheet.Cells["A2"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                // --- Header Styling ---
                var headers = new string[] { "UAN", "Employee Name", "Gross Wages", "PF Wages", "PF Contribution (Employee)", "LOP Days", "Employee Code" };
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[4, i + 1].Value = headers[i];
                }
                using (var range = worksheet.Cells[4, 1, 4, 7])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                var row = 5; // Start data from row 5
                foreach (var item in employeesWithPF)
                {
                    worksheet.Cells[row, 1].Value = item.StatutoryDetails?.UANNo ?? "N/A";
                    worksheet.Cells[row, 2].Value = $"{item.Record.Employee.FirstName} {item.Record.Employee.LastName}";
                    worksheet.Cells[row, 3].Value = item.Record.GrossEarnings;
                    worksheet.Cells[row, 4].Value = item.Record.ComponentDetails.FirstOrDefault(c => c.ComponentName == "Basic Salary")?.Amount ?? 0;
                    worksheet.Cells[row, 5].Value = item.Record.ComponentDetails.FirstOrDefault(c => c.ComponentName == "P. F.")?.Amount ?? 0;
                    worksheet.Cells[row, 6].Value = item.Record.LOPDays;
                    worksheet.Cells[row, 7].Value = item.Record.Employee.EmployeeCode;
                    row++;
                }

                // --- Number Formatting ---
                worksheet.Cells[5, 3, row - 1, 5].Style.Numberformat.Format = "₹ #,##0.00"; // Currency
                worksheet.Cells[5, 6, row - 1, 6].Style.Numberformat.Format = "0.0";     // LOP Days

                // --- Totals Row ---
                worksheet.Cells[row, 2].Value = "TOTALS";
                worksheet.Cells[row, 2].Style.Font.Bold = true;
                worksheet.Cells[row, 3].Formula = $"SUM(C5:C{row - 1})"; // Total Gross
                worksheet.Cells[row, 4].Formula = $"SUM(D5:D{row - 1})"; // Total PF Wages
                worksheet.Cells[row, 5].Formula = $"SUM(E5:E{row - 1})"; // Total PF Contribution
                worksheet.Cells[row, 3, row, 5].Style.Numberformat.Format = "₹ #,##0.00";
                worksheet.Cells[row, 3, row, 5].Style.Font.Bold = true;

                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
                return await package.GetAsByteArrayAsync();
            }
        }

            public async Task<byte[]> GenerateEsicReportExcelAsync(int payrollRunId)
            {
            var recordsWithDetails = await _context.Tb_MonthlySalaryRecords
                .Include(r => r.Employee)
                .Include(r => r.ComponentDetails)
                .Where(r => r.PayrollRunID == payrollRunId)
                .Select(r => new
                {
                    Record = r,
                    StatutoryDetails = _context.Tb_EmployeeStatutoryDetails
                                               .FirstOrDefault(s => s.EmployeeID == r.EmployeeID && !s.IsDeleted)
                })
                .ToListAsync();

            // Filter for employees who actually have an ESIC contribution
            var employeesWithESIC = recordsWithDetails
                .Where(item => (item.Record.ComponentDetails.FirstOrDefault(c => c.ComponentName == "ESIC")?.Amount ?? 0) > 0)
                .ToList();

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("ESIC Contribution");

                // --- NEW: Report Title and Metadata ---
                worksheet.Cells["A1:E1"].Merge = true;
                worksheet.Cells["A1"].Value = "ESIC Monthly Contribution Report";
                worksheet.Cells["A1"].Style.Font.Bold = true;
                worksheet.Cells["A1"].Style.Font.Size = 16;
                worksheet.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                worksheet.Cells["A2:E2"].Merge = true;
                worksheet.Cells["A2"].Value = $"Generated on: {DateTime.Now:dd-MMM-yyyy HH:mm}";
                worksheet.Cells["A2"].Style.Font.Italic = true;
                worksheet.Cells["A2"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;


                // --- UPDATED: Header Styling ---
                var headers = new string[] { "IP Number (ESIC No)", "Employee Name", "Payable Days", "ESIC Wages (Gross)", "Employee Contribution" };
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[4, i + 1].Value = headers[i];
                }
                using (var range = worksheet.Cells[4, 1, 4, 5])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                var row = 5; // Start data from row 5
                foreach (var item in employeesWithESIC)
                {
                    worksheet.Cells[row, 1].Value = item.StatutoryDetails?.ESINo ?? "N/A";
                    worksheet.Cells[row, 2].Value = $"{item.Record.Employee.FirstName} {item.Record.Employee.LastName}";
                    worksheet.Cells[row, 3].Value = item.Record.PayableDays;
                    worksheet.Cells[row, 4].Value = item.Record.GrossEarnings;
                    worksheet.Cells[row, 5].Value = item.Record.ComponentDetails.FirstOrDefault(c => c.ComponentName == "ESIC")?.Amount ?? 0;
                    row++;
                }

                // --- NEW: Number Formatting ---
                worksheet.Cells[5, 4, row - 1, 5].Style.Numberformat.Format = "₹ #,##0.00"; // Currency
                worksheet.Cells[5, 3, row - 1, 3].Style.Numberformat.Format = "0.0"; // Days

                // --- NEW: Totals Row ---
                worksheet.Cells[row, 3].Value = "TOTALS";
                worksheet.Cells[row, 3].Style.Font.Bold = true;
                worksheet.Cells[row, 4].Formula = $"SUM(D5:D{row - 1})";
                worksheet.Cells[row, 5].Formula = $"SUM(E5:E{row - 1})";
                worksheet.Cells[row, 4, row, 5].Style.Numberformat.Format = "₹ #,##0.00";
                worksheet.Cells[row, 4, row, 5].Style.Font.Bold = true;


                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
                return await package.GetAsByteArrayAsync();
            }
        }

        public async Task<byte[]> GenerateProfessionalTaxReportExcelAsync(int payrollRunId)
        {
            var records = await _context.Tb_MonthlySalaryRecords
               .Include(r => r.Employee)
               .Include(r => r.ComponentDetails)
               .Where(r => r.PayrollRunID == payrollRunId)
               .ToListAsync();

            var employeesWithPT = records
                .Where(r => (r.ComponentDetails.FirstOrDefault(c => c.ComponentName == "P. T.")?.Amount ?? 0) > 0)
                .ToList();

            ExcelPackage.License.SetNonCommercialOrganization("CompanyPlatform");

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Professional Tax");

                // --- NEW: Report Title and Metadata ---
                worksheet.Cells["A1:D1"].Merge = true;
                worksheet.Cells["A1"].Value = "Professional Tax Deduction Report";
                worksheet.Cells["A1"].Style.Font.Bold = true;
                worksheet.Cells["A1"].Style.Font.Size = 16;
                worksheet.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                worksheet.Cells["A2:D2"].Merge = true;
                worksheet.Cells["A2"].Value = $"Generated on: {DateTime.Now:dd-MMM-yyyy HH:mm}";
                worksheet.Cells["A2"].Style.Font.Italic = true;
                worksheet.Cells["A2"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                // --- UPDATED: Header Styling ---
                var headers = new string[] { "Employee Code", "Employee Name", "Gross Salary", "PT Deduction" };
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[4, i + 1].Value = headers[i];
                }
                using (var range = worksheet.Cells[4, 1, 4, 4])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                var row = 5;
                foreach (var record in employeesWithPT)
                {
                    worksheet.Cells[row, 1].Value = record.Employee.EmployeeCode;
                    worksheet.Cells[row, 2].Value = $"{record.Employee.FirstName} {record.Employee.LastName}";
                    worksheet.Cells[row, 3].Value = record.GrossEarnings;
                    worksheet.Cells[row, 4].Value = record.ComponentDetails.FirstOrDefault(c => c.ComponentName == "P. T.")?.Amount ?? 0;
                    row++;
                }

                // --- NEW: Number Formatting ---
                worksheet.Cells[5, 3, row - 1, 4].Style.Numberformat.Format = "₹ #,##0.00";

                // --- NEW: Totals Row ---
                worksheet.Cells[row, 2].Value = "TOTALS";
                worksheet.Cells[row, 2].Style.Font.Bold = true;
                worksheet.Cells[row, 3].Formula = $"SUM(C5:C{row - 1})";
                worksheet.Cells[row, 4].Formula = $"SUM(D5:D{row - 1})";
                worksheet.Cells[row, 3, row, 4].Style.Numberformat.Format = "₹ #,##0.00";
                worksheet.Cells[row, 3, row, 4].Style.Font.Bold = true;


                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
                return await package.GetAsByteArrayAsync();
            }
        }

        public async Task<byte[]> GenerateTdsReportExcelAsync(int payrollRunId)
        {
            var records = await _context.Tb_MonthlySalaryRecords
               .Include(r => r.Employee)
               .Include(r => r.ComponentDetails)
               .Where(r => r.PayrollRunID == payrollRunId)
               .ToListAsync();

            // Filter for employees who actually have a TDS deduction
            var employeesWithTDS = records
                .Where(r => (r.ComponentDetails.FirstOrDefault(c => c.ComponentName == "TDS")?.Amount ?? 0) > 0)
                .ToList();

            ExcelPackage.License.SetNonCommercialOrganization("CompanyPlatform");


            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("TDS Deductions");

                // --- Report Title and Metadata ---
                worksheet.Cells["A1:D1"].Merge = true;
                worksheet.Cells["A1"].Value = "TDS Deduction Report";
                worksheet.Cells["A1"].Style.Font.Bold = true;
                worksheet.Cells["A1"].Style.Font.Size = 16;
                worksheet.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                worksheet.Cells["A2:D2"].Merge = true;
                worksheet.Cells["A2"].Value = $"Generated on: {DateTime.Now:dd-MMM-yyyy HH:mm}";
                worksheet.Cells["A2"].Style.Font.Italic = true;
                worksheet.Cells["A2"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                // --- Header Styling ---
                var headers = new string[] { "Employee Code", "Employee Name", "Gross Salary", "TDS Deduction" };
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[4, i + 1].Value = headers[i];
                }
                using (var range = worksheet.Cells[4, 1, 4, 4])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                    range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                var row = 5;
                foreach (var record in employeesWithTDS)
                {
                    worksheet.Cells[row, 1].Value = record.Employee.EmployeeCode;
                    worksheet.Cells[row, 2].Value = $"{record.Employee.FirstName} {record.Employee.LastName}";
                    worksheet.Cells[row, 3].Value = record.GrossEarnings;
                    // Get the TDS component specifically
                    worksheet.Cells[row, 4].Value = record.ComponentDetails.FirstOrDefault(c => c.ComponentName == "TDS")?.Amount ?? 0;
                    row++;
                }

                // --- Number Formatting ---
                worksheet.Cells[5, 3, row - 1, 4].Style.Numberformat.Format = "₹ #,##0.00";

                // --- Totals Row ---
                worksheet.Cells[row, 2].Value = "TOTALS";
                worksheet.Cells[row, 2].Style.Font.Bold = true;
                worksheet.Cells[row, 3].Formula = $"SUM(C5:C{row - 1})";
                worksheet.Cells[row, 4].Formula = $"SUM(D5:D{row - 1})";
                worksheet.Cells[row, 3, row, 4].Style.Numberformat.Format = "₹ #,##0.00";
                worksheet.Cells[row, 3, row, 4].Style.Font.Bold = true;

                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();
                return await package.GetAsByteArrayAsync();
            }
        }
    }
}