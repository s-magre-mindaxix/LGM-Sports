using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO.TaxAndCompliance;
using PayrollManagementAPI.Services.TaxAndCompliance;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaxAndComplianceController : ControllerBase
    {
        private readonly ITaxAndComplianceService _service;

        public TaxAndComplianceController(ITaxAndComplianceService service)
        {
            _service = service;
        }

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats(int year, int month)
        {
            var stats = await _service.GetDashboardStatsAsync(year, month);
            return Ok(stats);
        }

        [HttpGet("statutory-records")]
        public async Task<IActionResult> GetStatutoryRecords(int year, int month)
        {
            var records = await _service.GetStatutoryRecordsAsync(year, month);
            return Ok(records);
        }

        [HttpGet("compliance-status")]
        public async Task<IActionResult> GetComplianceStatus([FromQuery] int year, [FromQuery] int month)
        {
            var statuses = await _service.GetComplianceStatusAsync(year, month);
            return Ok(statuses);
        }

        [HttpPut("update-compliance-item")]
        public async Task<IActionResult> UpdateComplianceItem([FromBody] UpdateComplianceStatusDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _service.UpdateComplianceItemAsync(dto);

            if (!success)
            {
                return NotFound($"Compliance item with ID {dto.Id} not found.");
            }

            return NoContent(); 
        }

        [HttpGet("compliance-item/{id}")]
        public async Task<IActionResult> GetComplianceItemDetails(int id)
        {
            var details = await _service.GetComplianceItemDetailsAsync(id);

            if (details == null)
            {
                return NotFound();
            }

            return Ok(details);
        }
    }
}
