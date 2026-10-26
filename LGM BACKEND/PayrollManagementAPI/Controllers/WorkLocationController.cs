using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PayrollManagementAPI.DTO.WorkLocation;
using PayrollManagementAPI.Services.Worklocation;
using System.Threading.Tasks;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/worklocations")]
    [ApiController]
    [Authorize]
    public class WorkLocationController : ControllerBase
    {
        private readonly IWorkLocationService _workLocationService;
        private readonly ILogger<WorkLocationController> _logger;

        public WorkLocationController(IWorkLocationService workLocationService, ILogger<WorkLocationController> logger)
        {
            _workLocationService = workLocationService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("API endpoint called: GetAll WorkLocations");
            var locations = await _workLocationService.GetAllLocationsAsync();
            return Ok(locations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("API endpoint called: GetById for WorkLocation ID: {LocationId}", id);
            var location = await _workLocationService.GetLocationByIdAsync(id);

            if (location == null)
            {
                _logger.LogWarning("GetById failed. WorkLocation with ID {LocationId} not found or is inactive.", id);
                return NotFound(new { message = $"WorkLocation with ID {id} not found or is inactive." });
            }

            return Ok(location);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] WorkLocationDto locationDto)
        {
            _logger.LogInformation("API endpoint called: Create WorkLocation");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var createdLocation = await _workLocationService.CreateLocationAsync(locationDto);
            return CreatedAtAction(nameof(GetById), new { id = createdLocation.ID }, createdLocation);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] WorkLocationDto locationDto)
        {
            _logger.LogInformation("API endpoint called: Update WorkLocation for ID: {LocationId}", id);
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _workLocationService.UpdateLocationAsync(id, locationDto);
            if (!result)
            {
                _logger.LogWarning("Update failed. WorkLocation with ID {LocationId} not found or is inactive.", id);
                return NotFound(new { message = $"WorkLocation with ID {id} not found or is inactive." });
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("API endpoint called: Delete WorkLocation for ID: {LocationId}", id);
            var result = await _workLocationService.DeleteLocationAsync(id);
            if (!result)
            {
                _logger.LogWarning("Delete failed. WorkLocation with ID {LocationId} not found.", id);
                return NotFound(new { message = $"WorkLocation with ID {id} not found." });
            }

            return Ok(new { message = $"WorkLocation with ID {id} has been deactivated." });
        }
    }
}