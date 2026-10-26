using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.Services.EmployeeReport;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeReportsController : ControllerBase
    {
        private readonly IEmployeeReportService _employeeReportService;

        public EmployeeReportsController(IEmployeeReportService employeeReportService)
        {
            _employeeReportService = employeeReportService;
        }

        [HttpGet("master")]
        public async Task<IActionResult> GetEmployeeMasterReport()
        {
            var report = await _employeeReportService.GenerateEmployeeMasterReportAsync();
            return Ok(report);
        }

        [HttpGet("headcount")]
        public async Task<IActionResult> GetHeadcountAnalysis()
        {
            var analysis = await _employeeReportService.GenerateHeadcountAnalysisAsync();
            return Ok(analysis);
        }

        [HttpGet("attendance-summary")]
        public async Task<IActionResult> GetAttendanceSummary([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            if (startDate == default || endDate == default)
            {
                return BadRequest("Please provide a valid startDate and endDate.");
            }
            var summary = await _employeeReportService.GenerateAttendanceSummaryAsync(startDate, endDate);
            return Ok(summary);
        }

        [HttpGet("leave-balance")]
        public async Task<IActionResult> GetLeaveBalanceReport([FromQuery] int? financialYear)
        {
            int year = financialYear ?? (DateTime.UtcNow.Month >= 4 ? DateTime.UtcNow.Year : DateTime.UtcNow.Year - 1);
            var report = await _employeeReportService.GenerateLeaveBalanceReportAsync(year);
            return Ok(report);
        }

        [HttpGet("department-wise-analysis")]
        public async Task<IActionResult> GetDepartmentWiseAnalysis()
        {
            var analysis = await _employeeReportService.GenerateDepartmentWiseAnalysisAsync();
            return Ok(analysis);
        }

        [HttpGet("master/download")]
        public async Task<IActionResult> GetEmployeeMasterReportExcel()
        {
            try
            {
                var fileBytes = await _employeeReportService.GenerateEmployeeMasterReportExcelAsync();

                var fileName = $"EmployeeMasterReport_{DateTime.Now:yyyy-MM-dd}.xlsx";
                var contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while generating the Excel file: {ex.Message}");
            }
        }

        [HttpGet("attendance-summary/download")]
        public async Task<IActionResult> GetAttendanceSummaryExcel([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            if (startDate == default || endDate == default)
            {
                return BadRequest("Please provide a valid startDate and endDate.");
            }

            try
            {
                var fileBytes = await _employeeReportService.GenerateAttendanceSummaryExcelAsync(startDate, endDate);
                var fileName = $"AttendanceSummary_{startDate:yyyy-MM-dd}_to_{endDate:yyyy-MM-dd}.xlsx";
                var contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while generating the Excel file: {ex.Message}");
            }
        }

        [HttpGet("leave-balance/download")]
        public async Task<IActionResult> GetLeaveBalanceReportExcel([FromQuery] int? financialYear)
        {
            int year = financialYear ?? (DateTime.UtcNow.Month >= 4 ? DateTime.UtcNow.Year : DateTime.UtcNow.Year - 1);

            try
            {
                var fileBytes = await _employeeReportService.GenerateLeaveBalanceReportExcelAsync(year);
                var fileName = $"LeaveBalanceReport_FY{year}-{year + 1}.xlsx";
                var contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while generating the Excel file: {ex.Message}");
            }
        }

        [HttpGet("monthly-salary-register")]
        public async Task<IActionResult> GetMonthlySalaryRegister([FromQuery] int month, [FromQuery] int year)
        {
            var report = await _employeeReportService.GenerateMonthlySalaryRegisterAsync(month, year);
            return Ok(report);
        }

        [HttpGet("cost-center-analysis")]
        public async Task<IActionResult> GetCostCenterAnalysis([FromQuery] int month, [FromQuery] int year)
        {
            var report = await _employeeReportService.GenerateCostCenterAnalysisAsync(month, year);
            return Ok(report);
        }


        [HttpGet("bonus-incentive-report")]
        public async Task<IActionResult> GetBonusReport([FromQuery] string financialYear)
        {
            var report = await _employeeReportService.GenerateBonusReportAsync(financialYear);
            return Ok(report);
        }

        [HttpGet("bank-transfer-summary")]
        public async Task<IActionResult> GetBankTransferSummary([FromQuery] int month, [FromQuery] int year)
        {
            var report = await _employeeReportService.GenerateBankTransferSummaryAsync(month, year);
            return Ok(report);
        }

        [HttpGet("monthly-salary-register/download")]
        public async Task<IActionResult> GetMonthlySalaryRegisterExcel([FromQuery] int month, [FromQuery] int year)
        {
            var fileBytes = await _employeeReportService.GenerateMonthlySalaryRegisterExcelAsync(month, year);
            var fileName = $"MonthlySalaryRegister_{year}-{month:D2}.xlsx";
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        [HttpGet("bonus-incentive-report/download")]
        public async Task<IActionResult> GetBonusReportExcel([FromQuery] string financialYear)
        {
            var fileBytes = await _employeeReportService.GenerateBonusReportExcelAsync(financialYear);
            var fileName = $"BonusReport_{financialYear}.xlsx";
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        [HttpGet("bank-transfer-summary/download")]
        public async Task<IActionResult> GetBankTransferSummaryExcel([FromQuery] int month, [FromQuery] int year)
        {
            var fileBytes = await _employeeReportService.GenerateBankTransferSummaryExcelAsync(month, year);
            var fileName = $"BankTransferSummary_{year}-{month:D2}.xlsx";
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        [HttpGet("employer-pf-report")]
        public async Task<IActionResult> GetEmployerPfReport([FromQuery] int month, [FromQuery] int year)
        {
            var report = await _employeeReportService.GenerateEmployerPfReportAsync(month, year);
            return Ok(report);
        }

        [HttpGet("employer-pf-report/download")]
        public async Task<IActionResult> DownloadEmployerPfReport([FromQuery] int month, [FromQuery] int year)
        {
            var excelBytes = await _employeeReportService.GenerateEmployerPfReportExcelAsync(month, year);
            var fileName = $"Employer-PF-Report-{year}-{month:00}.xlsx";
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        [HttpGet("detailed-attendance-report")]
        public async Task<IActionResult> GetDetailedAttendanceReport([FromQuery] int month, [FromQuery] int year, [FromQuery] int? employeeId = null)
        {
            if (month < 1 || month > 12 || year < 2000)
            {
                return BadRequest("Invalid month or year provided.");
            }

            var reportData = await _employeeReportService.GenerateDetailedAttendanceReportAsync(month, year, employeeId);

            return Ok(reportData);
        }

        [HttpGet("expense-claim-report")]
        public async Task<IActionResult> GetExpenseClaimReport([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] string? status)
        {
            if (startDate > endDate)
            {
                return BadRequest("Start date cannot be after end date.");
            }

            var reportData = await _employeeReportService.GenerateExpenseClaimReportAsync(startDate, endDate, status);
            return Ok(reportData);
        }

        [HttpGet("expense-claim-report/download")]
        public async Task<IActionResult> DownloadExpenseClaimReport([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] string? status)
        {
            if (startDate > endDate)
            {
                return BadRequest("Start date cannot be after end date.");
            }

            var fileBytes = await _employeeReportService.GenerateExpenseClaimReportExcelAsync(startDate, endDate, status);
            var fileName = $"ExpenseClaimReport_{startDate:yyyy-MM-dd}_to_{endDate:yyyy-MM-dd}.xlsx";
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        //[HttpGet("leave-encashment-report")]
        //public async Task<IActionResult> GetLeaveEncashmentReport([FromQuery] int financialYear)
        //{
        //    var result = await _employeeReportService.GenerateLeaveEncashmentReportAsync(financialYear);
        //    return Ok(result);
        //}

        //[HttpGet("leave-encashment-report/download")]
        //public async Task<IActionResult> DownloadLeaveEncashmentReport([FromQuery] int financialYear)
        //{
        //    var excelData = await _employeeReportService.GenerateLeaveEncashmentReportExcelAsync(financialYear);
        //    var fileName = $"Leave_Encashment_Report_{financialYear}.xlsx";
        //    return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        //}
    }
}
