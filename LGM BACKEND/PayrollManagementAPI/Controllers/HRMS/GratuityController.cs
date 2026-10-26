using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.Services.Gratuity;

namespace PayrollManagementAPI.Controllers.HRMS
{
    [Route("api/[controller]")]
    [ApiController]
    public class GratuityController : ControllerBase
    {
        private readonly IGratuityService _gratuityService;

        public GratuityController(IGratuityService gratuityService)
        {
            _gratuityService = gratuityService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllGratuityRecords()
        {
            try
            {
                // Try to get email from Claims first (Standard JWT), fallback to Identity.Name
                var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                                ?? User.Identity?.Name;

                if (string.IsNullOrEmpty(userEmail))
                {
                    return BadRequest(new { message = "User email not found in token." });
                }

                var isAdmin = User.IsInRole("Admin") || User.IsInRole("HR");

                var result = await _gratuityService.GetGratuityDashboardData(userEmail, isAdmin);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching records", error = ex.Message });
            }
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessGratuity()
        {
            try
            {
                await _gratuityService.ProcessGratuityForAllEligibleEmployees();
                return Ok(new { message = "Gratuity processed successfully. Records updated for active and resigned employees." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error processing gratuity", error = ex.Message });
            }
        }
    }
}
