using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO.SalaryStructure;
using PayrollManagementAPI.Services.SalaryStructure;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalaryStructureController : ControllerBase
    {
        private readonly ISalaryStructureService _service;
        private readonly ILogger<SalaryStructureController> _logger;
        public SalaryStructureController(ISalaryStructureService service, ILogger<SalaryStructureController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet("view")]

        public async Task<IActionResult> GetSalaryStructureView()
        {
            var result = await _service.GetSalaryStructureViewAsync(User);
            return Ok(result);
        }

        [HttpGet("{employeeId}")]
        public async Task<IActionResult> GetStructureByEmployeeId(int employeeId)
        {
            var result = await _service.GetSalaryStructureByEmployeeIdAsync(employeeId);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet("view/{employeeId}")]
        public async Task<IActionResult> GetStructureViewEmployeeId(int employeeId)
        {
            var result = await _service.GetSalaryStructureViewByIdAsync(employeeId);
            return result == null ? NotFound() : Ok(result);
        }



        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> CreateStructure([FromBody] SalaryStructureCreateDto dto)
        {
            try
            {
                var created = await _service.CreateSalaryStructureAsync(dto);
                return Ok(created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{employeeId}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> UpdateStructure(int employeeId, [FromBody] SalaryStructureUpdateDto dto)
        {
            if (employeeId != dto.EmployeeID)
                return BadRequest("Employee ID in URL and body do not match.");

            var success = await _service.UpdateSalaryStructureAsync(employeeId, dto);
            return success ? NoContent() : NotFound();
        }

        [HttpDelete("{employeeId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteStructure(int employeeId)
        {
            var success = await _service.DeleteSalaryStructureAsync(employeeId);
            return success ? NoContent() : NotFound();
        }

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = await _service.GetDashboardStatsAsync(User);
            return Ok(stats);
        }

        [HttpGet("{employeeId}/history")]
        public async Task<IActionResult> GetSalaryStructureHistory(int employeeId)
        {
            var history = await _service.GetSalaryStructureHistoryAsync(employeeId);
            return Ok(history);
        }

        [HttpPost("{employeeId}/revise")]
        public async Task<IActionResult> ReviseSalaryStructure(int employeeId, [FromBody] SalaryStructureReviseDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _service.ReviseSalaryStructureAsync(employeeId, dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "An internal error occurred during salary revision.");
            }
        }
    }
}
