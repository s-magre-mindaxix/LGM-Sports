using AnonymityAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.Services;
using PayrollManagementAPI.Services.LeaveManagement;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LeaveAdminController : ControllerBase
    {
        private readonly ILeaveManagementService _leaveManagementService;
        private readonly ILogger<LeaveAdminController> _logger;

        public LeaveAdminController(ILeaveManagementService leaveManagementService, ILogger<LeaveAdminController> logger)
        {
            _leaveManagementService = leaveManagementService;
            _logger = logger;
        }

        [HttpPost("accrue-yearly-earn-leave")]
        public async Task<IActionResult> AccrueYearlyEarnLeave([FromQuery] int yearToCredit)
        {
            var currentYear = DateTime.UtcNow.Year;
            if (yearToCredit > currentYear)
            {
                return BadRequest("Cannot run leave accrual for a future year. Please select the current year or a past year.");
            }

            if (yearToCredit < 2020)
            {
                return BadRequest("Please provide a valid year to credit leaves in.");
            }

            int yearToScan = yearToCredit - 1;
            _logger.LogInformation("Admin triggered yearly Earn Leave accrual for {YearToCredit} based on {YearToScan} attendance.", yearToCredit, yearToScan);

            try
            {
                var result = await _leaveManagementService.AccrueYearlyEarnLeavesFromPreviousYearAsync(yearToCredit, yearToScan);
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during yearly Earn Leave accrual for {YearToCredit}", yearToCredit);
                return StatusCode(500, "An internal server error occurred during the accrual process.");
            }
        }
    }
}
