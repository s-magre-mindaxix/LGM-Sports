using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.Services.LeaveEncashment;
using System.Security.Claims;

namespace PayrollManagementAPI.Controllers.HRMS
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaveEncashmentController : ControllerBase
    {
        private readonly ILeaveEncashmentService _leaveEncashmentService;

        public LeaveEncashmentController(ILeaveEncashmentService leaveEncashmentService)
        {
            _leaveEncashmentService = leaveEncashmentService;
        }

        [HttpGet("{financialYear}")]
        public async Task<IActionResult> Get(int financialYear)
        {
            try
            {
                var leaveEncashments = await _leaveEncashmentService.GetLeaveEncashmentsAsync(financialYear);
                return Ok(leaveEncashments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("process/{employeeId}/{financialYear}")]
        public async Task<IActionResult> Process(int employeeId, int financialYear)
        {
            try
            {
                var result = await _leaveEncashmentService.ProcessLeaveEncashmentForEmployeeAsync(employeeId, financialYear);
                if (result == null)
                {
                    return NotFound("No earned leave allocation found for the employee in the specified year.");
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("process/{financialYear}")]
        public async Task<IActionResult> ProcessForYear(int financialYear)
        {
            try
            {
                var result = await _leaveEncashmentService.ProcessLeaveEncashmentForYearAsync(financialYear);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Return a more specific error message to the frontend
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize] // Ensures the user is logged in
        [HttpGet("my-record/{financialYear}")]
        public async Task<IActionResult> GetMyRecord(int financialYear)
        {
            var employeeIdString = User.FindFirstValue("EmployeeId");

            if (string.IsNullOrEmpty(employeeIdString))
            {
                return Unauthorized("Employee ID claim not found in token.");
            }

            if (!int.TryParse(employeeIdString, out int employeeId))
            {
                return BadRequest("Invalid Employee ID format in token.");
            }

            try
            {
                var result = await _leaveEncashmentService.GetMyLeaveEncashmentAsync(employeeId, financialYear);

                if (result == null)
                {
                    return NotFound(new { message = $"No encashment record found for you for the year {financialYear}." });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An internal server error occurred: {ex.Message}" });
            }
        }
    }
}
