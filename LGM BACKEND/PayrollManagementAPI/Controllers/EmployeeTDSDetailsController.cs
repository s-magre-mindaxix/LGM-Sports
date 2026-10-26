using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.Core.DTO.EmployeeTDSDetails;
using CompanyPlatform.Core.Services.EmployeeTDSDetails;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/employee-tds-details")]
    [ApiController]
    [Authorize]
    public class EmployeeTDSDetailsController : ControllerBase
    {
        private readonly IEmployeeTDSService _service;
        public EmployeeTDSDetailsController(IEmployeeTDSService service) { _service = service; }

        [HttpGet("{employeeId}")]
        public async Task<IActionResult> Get(int employeeId)
        {
            var result = await _service.GetByEmployeeIdAsync(employeeId);
            return Ok(result);
        }

        [HttpPost("upsert")]
        public async Task<IActionResult> Upsert([FromBody] UpsertTDSDetailsDto dto)
        {
            var result = await _service.UpsertAsync(dto);
            return Ok(result);
        }
    }
}
