using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PayrollManagementAPI.DTO.Advance;
using PayrollManagementAPI.Services.Advance;
using System;
using System.Threading.Tasks;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AdvanceController : ControllerBase
    {
        private readonly IAdvanceService _advanceService;
        private readonly ILogger<AdvanceController> _logger;

        public AdvanceController(IAdvanceService advanceService, ILogger<AdvanceController> logger)
        {
            _advanceService = advanceService;
            _logger = logger;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateAdvance([FromBody] AdvanceCreateDto dto)
        {
            _logger.LogInformation("POST: api/Advance invoked.");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var createdAdvance = await _advanceService.CreateAdvanceAsync(dto);
                return CreatedAtAction(nameof(GetAdvanceById), new { id = createdAdvance.ID }, createdAdvance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating advance.");
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllAdvances()
        {
            _logger.LogInformation("GET: api/Advance invoked.");
            var advances = await _advanceService.GetAllAdvancesAsync();
            return Ok(advances);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAdvanceById(int id)
        {
            _logger.LogInformation("GET: api/Advance/{Id} invoked.", id);
            var advance = await _advanceService.GetAdvanceByIdAsync(id);
            if (advance == null)
            {
                _logger.LogWarning("Advance with ID {Id} not found.", id);
                return NotFound();
            }
            return Ok(advance);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetAdvancesByEmployee(int employeeId)
        {
            _logger.LogInformation("GET: api/Advance/employee/{EmployeeId} invoked.", employeeId);
            var advances = await _advanceService.GetAdvancesByEmployeeAsync(employeeId);
            return Ok(advances);
        }

        [HttpPut("status/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] AdvanceUpdateStatusDto dto)
        {
            _logger.LogInformation("PUT: api/Advance/status/{Id} invoked.", id);
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var updatedAdvance = await _advanceService.UpdateAdvanceStatusAsync(id, dto);
                if (updatedAdvance == null) return NotFound("Advance record not found.");
                return Ok(updatedAdvance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating advance status for ID {Id}.", id);
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAdvance(int id)
        {
            _logger.LogInformation("DELETE: api/Advance/{Id} invoked.", id);
            var result = await _advanceService.DeleteAdvanceAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpPost("{advanceId}/repayment")]
        [Authorize]
        public async Task<IActionResult> AddRepayment(int advanceId, [FromBody] AdvanceRepaymentCreateDto dto)
        {
            _logger.LogInformation("POST: api/Advance/{advanceId}/repayment invoked.", advanceId);
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var result = await _advanceService.AddRepaymentAsync(advanceId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding repayment for AdvanceID: {AdvanceID}", advanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{advanceId}/history")]
        [Authorize]
        public async Task<IActionResult> GetHistory(int advanceId)
        {
            _logger.LogInformation("GET: api/Advance/{advanceId}/history invoked.", advanceId);
            var history = await _advanceService.GetAdvanceHistoryAsync(advanceId);
            if (history == null)
            {
                _logger.LogWarning("History not found for AdvanceID: {AdvanceID}", advanceId);
                return NotFound();
            }
            return Ok(history);
        }


    }
}