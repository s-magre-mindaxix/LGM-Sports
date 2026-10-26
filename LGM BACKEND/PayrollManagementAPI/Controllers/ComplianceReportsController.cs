using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.Services.ComplianceReports;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComplianceReportsController : ControllerBase
    {
        private readonly IComplianceReportService _reportService;

        public ComplianceReportsController(IComplianceReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("pf-ecr/{payrollRunId}")]
        public async Task<IActionResult> DownloadPfEcr(int payrollRunId)
        {
            var fileBytes = await _reportService.GeneratePfEcrFileAsync(payrollRunId);
            if (fileBytes == null || fileBytes.Length == 0) return NotFound("No data found to generate PF ECR file.");

            var contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            var fileName = $"PF_ECR_Report_{DateTime.Now:MMyyyy}.xlsx";

            return File(fileBytes, contentType, fileName);
        }

        //[HttpGet("pf-ecr-text/{payrollRunId}")]
        //public async Task<IActionResult> GetPfEcrAsText(int payrollRunId)
        //{
        //    var ecrString = await _reportService.GetPfEcrTextAsync(payrollRunId);

        //    if (string.IsNullOrEmpty(ecrString))
        //    {
        //        ecrString = "No employees with PF contribution found for this period.";
        //    }

        //    return Ok(new EcrTextDto { EcrContent = ecrString });
        //}

        [HttpGet("esic-report/{payrollRunId}")]
        public async Task<IActionResult> DownloadEsicReport(int payrollRunId)
        {
            var fileBytes = await _reportService.GenerateEsicReportExcelAsync(payrollRunId);
            if (fileBytes == null || fileBytes.Length == 0)
            {
                return NotFound("No data found to generate ESIC report.");
            }

            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"ESIC_Report_{DateTime.Now:MMyyyy}.xlsx");
        }

        [HttpGet("pt-report/{payrollRunId}")]
        public async Task<IActionResult> DownloadPtReport(int payrollRunId)
        {
            var fileBytes = await _reportService.GenerateProfessionalTaxReportExcelAsync(payrollRunId);
            if (fileBytes == null || fileBytes.Length == 0)
            {
                return NotFound("No data found to generate PT report.");
            }

            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"PT_Report_{DateTime.Now:MMyyyy}.xlsx");
        }

        [HttpGet("tds-report/{payrollRunId}")]
        public async Task<IActionResult> DownloadTdsReport(int payrollRunId)
        {
            var fileBytes = await _reportService.GenerateTdsReportExcelAsync(payrollRunId);
            if (fileBytes == null || fileBytes.Length == 0)
            {
                return NotFound("No data found to generate TDS report.");
            }

            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"TDS_Report_{DateTime.Now:MMyyyy}.xlsx");
        }
    }
}
