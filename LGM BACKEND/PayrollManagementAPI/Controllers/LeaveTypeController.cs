using AnonymityAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PayrollManagementAPI.DTO.LeaveType;
using PayrollManagementAPI.Services.LeaveType;
using System;
using System.Threading.Tasks;

namespace AnonymityAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LeaveTypeController : ControllerBase
    {
        private readonly ILeaveTypeService _leaveTypeService;
        private readonly ILogger<LeaveTypeController> _logger;

        public LeaveTypeController(ILeaveTypeService leaveTypeService, ILogger<LeaveTypeController> logger)
        {
            _leaveTypeService = leaveTypeService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllLeaveTypes()
        {
            _logger.LogInformation("GET: api/LeaveType invoked.");
            var leaveTypes = await _leaveTypeService.GetAllLeaveTypesAsync();
            return Ok(leaveTypes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLeaveTypeById(int id)
        {
            _logger.LogInformation("GET: api/LeaveType/{Id} invoked.", id);
            var leaveType = await _leaveTypeService.GetLeaveTypeByIdAsync(id);
            if (leaveType == null)
            {
                _logger.LogWarning("LeaveType with ID {Id} not found.", id);
                return NotFound();
            }
            return Ok(leaveType);
        }

        [HttpPost]
        public async Task<IActionResult> CreateLeaveType([FromBody] LeaveTypeCreateDto leaveTypeDto)
        {
            _logger.LogInformation("POST: api/LeaveType invoked.");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var createdLeaveType = await _leaveTypeService.CreateLeaveTypeAsync(leaveTypeDto);
                return CreatedAtAction(nameof(GetLeaveTypeById), new { id = createdLeaveType.ID }, createdLeaveType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating leave type.");
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLeaveType(int id, [FromBody] LeaveTypeCreateDto leaveTypeDto)
        {
            _logger.LogInformation("PUT: api/LeaveType/{Id} invoked.", id);
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _leaveTypeService.UpdateLeaveTypeAsync(id, leaveTypeDto);
                if (!result) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating leave type with ID {Id}.", id);
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLeaveType(int id)
        {
            _logger.LogInformation("DELETE: api/LeaveType/{Id} invoked.", id);
            var result = await _leaveTypeService.DeleteLeaveTypeAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}