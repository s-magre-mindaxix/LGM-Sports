using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO.LeaveDetails;
using PayrollManagementAPI.Services.LeaveManagement;
using System.ComponentModel.DataAnnotations;


namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin, HR")]
    public class LeaveManagementController : ControllerBase
    {
        private readonly ILeaveManagementService _leaveManagementService;
        private readonly ILogger<LeaveManagementController> _logger;

        public LeaveManagementController(ILeaveManagementService leaveManagementService, ILogger<LeaveManagementController> logger)
        {
            _leaveManagementService = leaveManagementService;
            _logger = logger;
        }

        // === THIS IS THE NEW, CORRECT ENDPOINT ===
        [HttpPost("allocate-leaves")]
        public async Task<IActionResult> AllocateLeavesToAll([FromBody] LeaveAllocationDto allocationDto)
        {
            _logger.LogInformation("POST: api/LeaveManagement/allocate-leaves invoked for FY:{FinancialYear}", allocationDto.FinancialYear);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (allocationDto.FinancialYear < DateTime.Now.Year - 5 || allocationDto.FinancialYear > DateTime.Now.Year + 5)
            {
                return BadRequest("Invalid financial year specified.");
            }

            try
            {
                // It now calls the new method that exists in your service
                var result = await _leaveManagementService.AllocateLeavesToAllEmployeesAsync(allocationDto);
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while allocating leaves for {FinancialYear}", allocationDto.FinancialYear);
                return StatusCode(500, $"An internal server error occurred: {ex.Message}");
            }
        }

        // === THE METHOD THAT WAS CAUSING THE ERROR IS NOW GONE ===
        // The old HttpPost("allocate-yearly-leaves/{financialYear}") action has been removed.


        // This endpoint remains the same and is still useful
        [HttpGet("view-allocations/{financialYear}")]
        public async Task<IActionResult> ViewAllocatedLeaves(int financialYear)
        {
            _logger.LogInformation("GET: api/LeaveManagement/view-allocations/{FinancialYear} invoked.", financialYear);
            try
            {
                var result = await _leaveManagementService.GetAllocatedLeavesForYearAsync(financialYear);
                if (result == null || !result.Any())
                {
                    return NotFound($"No leave allocations found for the financial year {financialYear}.");
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while viewing leave allocations for {FinancialYear}", financialYear);
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [Authorize]
        [HttpPut("update-allocation/{assignLeaveTypeId}")]
        public async Task<IActionResult> UpdateAllocatedLeave(int assignLeaveTypeId, [FromBody] LeaveUpdateDto dto)
        {
            if (assignLeaveTypeId <= 0)
            {
                return BadRequest("Invalid allocation ID.");
            }

            // Basic validation for the DTO
            if (dto.AllocatedDays <= 0)
            {
                return BadRequest("Allocated days must be a positive number.");
            }

            var resultMessage = await _leaveManagementService.UpdateAllocatedLeaveAsync(assignLeaveTypeId, dto.AllocatedDays);

            if (resultMessage.StartsWith("Error:"))
            {
                // Not Found is a common case here
                if (resultMessage.Contains("not found"))
                {
                    return NotFound(resultMessage);
                }
                // Other errors would be treated as bad requests or server errors
                return BadRequest(resultMessage);
            }

            return Ok(new { message = resultMessage });
        }
    }

    public class LeaveUpdateDto
    {
        [Required]
        public decimal AllocatedDays { get; set; }
    }
}