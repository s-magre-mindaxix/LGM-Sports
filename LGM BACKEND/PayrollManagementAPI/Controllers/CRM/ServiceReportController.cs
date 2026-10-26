using CompanyPlatform.Core.DTO.ServiceReport;
using CompanyPlatform.Core.Services.ServiceReport;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceReportController : ControllerBase
    {
        private readonly IServiceReportService _serviceReportService;

        public ServiceReportController(IServiceReportService serviceReportService)
        {
            _serviceReportService = serviceReportService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceReportDto>>> GetServiceReports()
        {
            var serviceReports = await _serviceReportService.GetAllServiceReportsAsync();
            return Ok(serviceReports);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceReportDto>> GetServiceReport(int id)
        {
            var serviceReport = await _serviceReportService.GetServiceReportByIdAsync(id);

            if (serviceReport == null)
            {
                return NotFound();
            }

            return Ok(serviceReport);
        }

        [HttpPost]
        public async Task<ActionResult<ServiceReportDto>> PostServiceReport([FromForm] ServiceReportDto serviceReportDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdServiceReport = await _serviceReportService.CreateServiceReportAsync(serviceReportDto);
            return Ok("ServiceReport Created Successfully");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutServiceReport(int id, [FromForm] ServiceReportDto serviceReportDto)
        {
            if (id != serviceReportDto.Id)
            {
                return BadRequest("Service Report ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _serviceReportService.UpdateServiceReportAsync(id, serviceReportDto);

            if (!result)
            {
                return NotFound(new { message = $"Service Report with ID {id} not found." });
            }

            return Ok(new { message = "Service Report updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteServiceReport(int id)
        {
            var result = await _serviceReportService.DeleteServiceReportAsync(id);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
