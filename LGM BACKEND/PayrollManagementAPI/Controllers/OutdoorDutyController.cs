using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO.OutdoorDuty;
using PayrollManagementAPI.Services.OutdoorDuty;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OutdoorDutyController : ControllerBase
    {
        private readonly IOutdoorDutyService _odService;
        private readonly ILogger<OutdoorDutyController> _logger;

        public OutdoorDutyController(IOutdoorDutyService odService, ILogger<OutdoorDutyController> logger)
        {
            _odService = odService;
            _logger = logger;
        }

        private int GetCurrentEmployeeId()
        {
            var employeeIdClaim = User.Claims.FirstOrDefault(c => c.Type == "EmployeeId");
            if (employeeIdClaim == null || !int.TryParse(employeeIdClaim.Value, out var employeeId))
            {
                throw new InvalidOperationException("Employee ID not found in token.");
            }
            return employeeId;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOD([FromBody] CreateOutdoorDutyDto odDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var employeeId = GetCurrentEmployeeId();
                var createdOD = await _odService.CreateODAsync(odDto, employeeId);
                return CreatedAtAction(nameof(CreateOD), new { id = createdOD.Id }, createdOD);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating outdoor duty request.");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("my-ods")]
        public async Task<IActionResult> GetMyODs()
        {
            try
            {
                var employeeId = GetCurrentEmployeeId();
                var ods = await _odService.GetODsByEmployeeIdAsync(employeeId);
                return Ok(ods);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user's outdoor duty requests.");
                return StatusCode(500, new { message = "An error occurred while fetching your requests." });
            }
        }

        [HttpGet("pending-approvals")]
        [Authorize]
        public async Task<IActionResult> GetPendingApprovals()
        {
            try
            {
                var managerId = GetCurrentEmployeeId();
                var ods = await _odService.GetPendingODsForManagerAsync(managerId);
                return Ok(ods);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching pending OD approvals.");
                return StatusCode(500, new { message = "An error occurred while fetching pending approvals." });
            }
        }

        [HttpPut("{odId}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateODStatus(int odId, [FromBody] UpdateODStatusDto statusDto)
        {
            if (!ModelState.IsValid || (statusDto.Status != "Approved" && statusDto.Status != "Rejected"))
            {
                return BadRequest("Invalid status provided.");
            }

            try
            {
                var managerId = GetCurrentEmployeeId();
                var updatedOD = await _odService.UpdateODStatusAsync(odId, statusDto, managerId);
                return Ok(updatedOD);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating OD status for request ID {ODId}", odId);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("history")]
        [Authorize]
        public async Task<IActionResult> GetODHistory()
        {
            try
            {
                var history = await _odService.GetAllProcessedODsAsync();
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching outdoor duty history.");
                return StatusCode(500, new { message = "An error occurred while fetching OD history." });
            }
        }
    }
}
