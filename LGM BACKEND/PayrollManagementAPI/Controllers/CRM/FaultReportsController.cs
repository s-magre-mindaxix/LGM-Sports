using CompanyPlatform.Core.DTO.FaultReport;
using CompanyPlatform.Core.Services.FaultReport;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class FaultReportsController : ControllerBase
    {
        private readonly IFaultReportService _faultReportService;

        public FaultReportsController(IFaultReportService faultReportService)
        {
            _faultReportService = faultReportService;
        }

        [HttpGet]
        public async Task<IActionResult> GetFaultReports()
        {
            var reports = await _faultReportService.GetAllAsync();
            return Ok(reports);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFaultReport(int id)
        {
            var report = await _faultReportService.GetByIdAsync(id);
            if (report == null)
            {
                return NotFound();
            }
            return Ok(report);
        }

        [HttpPost]
        public async Task<IActionResult> CreateFaultReport([FromForm] FaultReportDto faultReportDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdReport = await _faultReportService.CreateAsync(faultReportDto);

            return Ok("Fault report created successfully");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFaultReport(int id, [FromForm] FaultReportDto faultReportDto)
        {
            if (id != faultReportDto.Id)
            {
                return BadRequest("ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _faultReportService.UpdateAsync(id, faultReportDto);
            if (!success)
            {
                return NotFound();
            }

            return NoContent(); 
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFaultReport(int id)
        {
            var success = await _faultReportService.DeleteAsync(id);
            if (!success)
            {
                return NotFound();
            }

            return NoContent(); 
        }
    }
}
