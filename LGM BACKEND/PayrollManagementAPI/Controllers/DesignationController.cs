using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.DTO.Designation;
using CompanyPlatform.Core.Services.Designation;
using System.Threading.Tasks;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/designations")]
    [ApiController]
    [Authorize]
    public class DesignationController : ControllerBase
    {
        private readonly IDesignationService _designationService;
        private readonly ILogger<DesignationController> _logger;

        public DesignationController(IDesignationService designationService, ILogger<DesignationController> logger)
        {
            _designationService = designationService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll Designations");
            var designations = await _designationService.GetAllDesignationsAsync();
            return Ok(designations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for Designation ID: {DesignationId}", id);
            var designation = await _designationService.GetDesignationByIdAsync(id);
            if (designation == null)
            {
                _logger.LogWarning("GetById failed. Designation with ID {DesignationId} not found or is inactive.", id);
                return NotFound(new { message = $"Designation with ID {id} not found or is inactive." });
            }
            return Ok(designation);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] DesignationDto designationDto)
        {
            _logger.LogInformation("API endpoint called: Create Designation");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var createdDesignation = await _designationService.CreateDesignationAsync(designationDto);
            return CreatedAtAction(nameof(GetById), new { id = createdDesignation.ID }, createdDesignation);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] DesignationDto designationDto)
        {
            _logger.LogInformation("API endpoint called: Update Designation for ID: {DesignationId}", id);
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _designationService.UpdateDesignationAsync(id, designationDto);
            if (!result)
            {
                _logger.LogWarning("Update failed. Designation with ID {DesignationId} not found or is inactive.", id);
                return NotFound(new { message = $"Designation with ID {id} not found or is inactive." });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete Designation for ID: {DesignationId}", id);
            var result = await _designationService.DeleteDesignationAsync(id);
            if (!result)
            {
                _logger.LogWarning("Delete failed. Designation with ID {DesignationId} not found.", id);
                return NotFound(new { message = $"Designation with ID {id} not found." });
            }

            return Ok(new { message = $"Designation with ID {id} has been deactivated." });
        }
    }
}