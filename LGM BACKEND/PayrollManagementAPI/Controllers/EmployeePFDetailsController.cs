using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.Core.DTO.EmployeePFDetails;
using CompanyPlatform.Core.Services.EmployeePFDetails;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/employee-pf-details")]
    [ApiController]
    [Authorize]
    public class EmployeePFDetailsController : ControllerBase
    {
        private readonly IEmployeePFDetailsService _service;

        public EmployeePFDetailsController(IEmployeePFDetailsService service)
        {
            _service = service;
        }

        [HttpGet("{employeeId}")]
        public async Task<IActionResult> GetByEmployeeId(int employeeId)
        {
            var result = await _service.GetByEmployeeIdAsync(employeeId);
            if (result == null)
            {
                return Ok(null); // Return OK with null body if not found, frontend will handle it
            }
            return Ok(result);
        }

        [HttpPost("upsert")]
        public async Task<IActionResult> Upsert([FromBody] UpsertPFDetailsDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _service.UpsertAsync(dto);
            return Ok(result);
        }
    }
}
