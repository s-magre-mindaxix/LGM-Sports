using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO.Level;
using PayrollManagementAPI.Services.Level;

namespace PayrollManagementAPI.Controllers.HRMS
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LevelController : ControllerBase
    {
        private readonly ILevelService _levelService;

        public LevelController(ILevelService levelService)
        {
            _levelService = levelService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllLevels()
        {
            var levels = await _levelService.GetAllLevelsAsync();
            return Ok(levels);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLevelById(int id)
        {
            var level = await _levelService.GetLevelByIdAsync(id);

            if (level == null)
                return NotFound();

            return Ok(level);
        }

        [HttpPost]
        public async Task<IActionResult> CreateLevel(CreateLevelDto dto)
        {
            var level = await _levelService.CreateLevelAsync(dto);
            return Ok(level);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLevel(int id, UpdateLevelDto dto)
        {
            var level = await _levelService.UpdateLevelAsync(id, dto);

            if (level == null)
                return NotFound();

            return Ok(level);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLevel(int id)
        {
            var deleted = await _levelService.DeleteLevelAsync(id);

            if (!deleted)
                return NotFound();

            return Ok(new { message = "Level deleted successfully" });
        }
    }
}
