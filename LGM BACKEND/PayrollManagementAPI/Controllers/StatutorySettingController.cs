using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO;
using PayrollManagementAPI.DTO.ExpenseType;
using PayrollManagementAPI.Services.StatutorySetting;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class StatutorySettingController : ControllerBase
    {
        private readonly IStatutorySettingService _service;

        public StatutorySettingController(IStatutorySettingService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllStatutorySettingsAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var setting = await _service.GetStatutorySettingByIdAsync(id);
            return setting == null ? NotFound() : Ok(setting);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] StatutorySettingDto dto)
        {
            var created = await _service.CreateStatutorySettingAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] StatutorySettingDto dto)
        {
            if (id != dto.Id) return BadRequest("ID mismatch.");
            var success = await _service.UpdateStatutorySettingAsync(id, dto);
            return success ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteStatutorySettingAsync(id);
            return NoContent();
        }
    }
}
