using CompanyPlatform.Core.DTO.Installation;
using CompanyPlatform.Core.Services.InstallationReport;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class InstallationReportController : ControllerBase
    {
        private readonly IInstallationReportService _service;

        public InstallationReportController(IInstallationReportService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllInstallationReports()
        {
            var reports = await _service.GetAllInstallationReportsAsync();
            return Ok(reports);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInstallationReport(int id)
        {
            var report = await _service.GetInstallationReportByIdAsync(id);
            if (report == null)
            {
                return NotFound($"Installation report with ID {id} not found.");
            }
            return Ok(report);
        }

        [HttpPost]
        public async Task<IActionResult> CreateInstallationReport([FromBody] CreateInstallationReportDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newReport = await _service.CreateInstallationReportAsync(createDto);
            return Ok("Installation Report Create Successfully");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInstallationReport(int id, [FromBody] CreateInstallationReportDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _service.UpdateInstallationReportAsync(id, updateDto);

            if (!result)
            {
                return NotFound($"Installation report with ID {id} not found.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInstallationReport(int id)
        {
            var result = await _service.DeleteInstallationReportAsync(id);

            if (!result)
            {
                return NotFound($"Installation report with ID {id} not found.");
            }

            return NoContent();
        }
    }
}
