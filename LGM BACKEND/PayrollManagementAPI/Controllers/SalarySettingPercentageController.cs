using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO;
using PayrollManagementAPI.Services.SalarySetting;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalarySettingPercentageController : ControllerBase
    {
        private readonly ISalarySettingService _service;

        public SalarySettingPercentageController(ISalarySettingService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllSettingsAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data = await _service.GetSettingByIdAsync(id);
            if (data == null) return NotFound();
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SalarySettingPercentageCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateSettingAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SalarySettingPercentageCreateUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _service.UpdateSettingAsync(id, dto);
            if (!success) return NotFound();

            return Ok(new { message = "Salary setting updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteSettingAsync(id);
            if (!success) return NotFound();

            return Ok(new { message = "Salary setting deleted successfully" });
        }

        [HttpGet("earnings")]
        public async Task<IActionResult> GetEarningComponents()
        {
            var components = await _service.GetEarningComponentsAsync();
            return Ok(components);
        }
    }
}
