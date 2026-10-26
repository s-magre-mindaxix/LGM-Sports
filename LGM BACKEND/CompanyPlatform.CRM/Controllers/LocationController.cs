
using CompanyPlatform.Core.DTOs.Inventory;
using CompanyPlatform.Core.Interfaces.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocationController : ControllerBase
    {
        private readonly ILocationService _locationService;

        public LocationController(
            ILocationService locationService)
        {
            _locationService = locationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var locations = await _locationService.GetAllAsync();

            return Ok(locations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var location = await _locationService.GetByIdAsync(id);

            if (location == null)
            {
                return NotFound(new
                {
                    message = "Location not found."
                });
            }

            return Ok(location);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] LocationDto locationDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var location =
                    await _locationService.CreateAsync(locationDto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = location.LocationId },
                    location);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] LocationDto locationDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var location =
                    await _locationService.UpdateAsync(
                        id,
                        locationDto);

                if (location == null)
                {
                    return NotFound(new
                    {
                        message = "Location not found."
                    });
                }

                return Ok(location);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _locationService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Location not found."
                });
            }

            return Ok(new
            {
                message = "Location soft-deleted successfully."
            });
        }
    }
}
