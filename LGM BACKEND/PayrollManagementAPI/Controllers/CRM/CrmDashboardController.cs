using CompanyPlatform.CRM.Services.Dashboards.Dashboard;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class CrmDashboardController : ControllerBase
    {
        private readonly ICrmDashboardService _service;

        public CrmDashboardController(ICrmDashboardService service)
        {
            _service = service;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var result = await _service.GetDashboardStatsAsync();
            return Ok(result);
        }
    }
}
