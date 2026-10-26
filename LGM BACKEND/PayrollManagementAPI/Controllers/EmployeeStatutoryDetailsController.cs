using CompanyPlatform.Core.DTO.EmployeeStatutoryDetails;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.DTO.EmployeeStatutoryDetails;
using PayrollManagementAPI.Services.EmployeeStatutoryDetails;
using System.Threading.Tasks;
using CompanyPlatform.Core.Services.EmployeeStatutoryDetails;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/employee-statutory-details")]
    [ApiController]
    [Authorize]
    public class EmployeeStatutoryDetailsController : ControllerBase
    {
        private readonly IEmployeeStatutoryDetailsService _service;
        private readonly ILogger<EmployeeStatutoryDetailsController> _logger;

        public EmployeeStatutoryDetailsController(IEmployeeStatutoryDetailsService service, ILogger<EmployeeStatutoryDetailsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet("by-employee/{employeeId}")]
        [Authorize]
        public async Task<IActionResult> GetByEmployeeId(int employeeId)
        {
            _logger.LogInformation("API endpoint called: GetByEmployeeId for EmployeeID: {EmployeeId}", employeeId);
            var result = await _service.GetByEmployeeIdAsync(employeeId);
            if (result == null)
            {
                return NotFound(new { message = $"Statutory details not found for Employee ID {employeeId}." });
            }
            return Ok(result);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateStatutoryDetailsDto dto)
        {
            _logger.LogInformation("API endpoint called: Create statutory details for EmployeeID: {EmployeeId}", dto.EmployeeID);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _service.CreateAsync(dto);
            if (result == null)
            {
                return Conflict(new { message = $"Statutory details already exist for Employee ID {dto.EmployeeID}." });
            }

            return CreatedAtAction(nameof(GetByEmployeeId), new { employeeId = result.EmployeeID }, result);
        }

        [HttpPut("by-employee/{employeeId}")]
        [Authorize]
        public async Task<IActionResult> Update(int employeeId, [FromBody] UpdateStatutoryDetailsDto dto)
        {
            _logger.LogInformation("API endpoint called: Update statutory details for EmployeeID: {EmployeeId}", employeeId);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _service.UpdateByEmployeeIdAsync(employeeId, dto);
            if (result == null)
            {
                return NotFound(new { message = $"Statutory details not found for Employee ID {employeeId}." });
            }

            return Ok(result);
        }

        [HttpDelete("by-employee/{employeeId}")]
        [Authorize]
        public async Task<IActionResult> Delete(int employeeId)
        {
            _logger.LogInformation("API endpoint called: Delete statutory details for EmployeeID: {EmployeeId}", employeeId);
            var result = await _service.DeleteByEmployeeIdAsync(employeeId);
            if (!result)
            {
                return NotFound(new { message = $"Statutory details not found for Employee ID {employeeId}." });
            }

            return Ok(new { message = $"Statutory details for Employee ID {employeeId} have been deactivated." });
        }
    }
}