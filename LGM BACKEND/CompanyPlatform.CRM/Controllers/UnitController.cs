
using CompanyPlatform.Core.DTOs.Inventory;
using CompanyPlatform.Core.Interfaces.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UnitController : ControllerBase
    {
        private readonly IUnitService _unitService;

        public UnitController(IUnitService unitService)
        {
            _unitService = unitService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var units = await _unitService.GetAllAsync();

            return Ok(units);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var unit = await _unitService.GetByIdAsync(id);

            if (unit == null)
            {
                return NotFound(new
                {
                    message = "Unit not found."
                });
            }

            return Ok(unit);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] UnitDto unitDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var unit = await _unitService.CreateAsync(unitDto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = unit.UnitId },
                unit);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UnitDto unitDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var unit = await _unitService.UpdateAsync(id, unitDto);

            if (unit == null)
            {
                return NotFound(new
                {
                    message = "Unit not found."
                });
            }

            return Ok(unit);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _unitService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Unit not found."
                });
            }

            return Ok(new
            {
                message = "Unit soft-deleted successfully."
            });
        }
    }
}
