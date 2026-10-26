using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO;
using PayrollManagementAPI.DTO.ExpenseType;
using PayrollManagementAPI.Services.ExpenseType;
using PayrollManagementAPI.Services.Shift;
using System.Runtime.CompilerServices;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShiftController : ControllerBase
    {
        private readonly IShiftService _shiftService;
        private readonly ILogger<ShiftController> _logger;

        public ShiftController(IShiftService shiftService, ILogger<ShiftController> logger)
        {
            _shiftService = shiftService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var shift = await _shiftService.GetAllShiftsAsync();
                return Ok(shift);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching all shift types.");
                return StatusCode(500, "An internal server error has occurred.");
            }
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var shift = await _shiftService.GetShiftByIdAsync(id);
                if (shift == null)
                {
                    return NotFound(new { message = $"shift with ID {id} not found." });
                }
                return Ok(shift);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching shift type with ID {Id}.", id);
                return StatusCode(500, "An internal server error has occurred.");
            }
        }


        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] ShiftDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var shift = await _shiftService.CreateShiftAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = shift.Id }, shift);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a new shift type.");
                return StatusCode(500, "An internal server error has occurred.");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] ShiftDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest("ID in URL and body do not match.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _shiftService.UpdateShiftAsync(id, dto);
                if (!result)
                {
                    return NotFound(new { message = $"shift with ID {id} not found." });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating shift type with ID {Id}.", id);
                return StatusCode(500, "An internal server error has occurred.");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _shiftService.DeleteShiftAsync(id);
            return Ok();
        }
    }
}
