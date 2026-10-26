
using CompanyPlatform.CRM.DTO.Bundle;
using CompanyPlatform.CRM.Services.Bundle;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BundleController : ControllerBase
    {
        private readonly IBundleService _service;

        public BundleController(IBundleService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            if (result == null)
                return NotFound(new
                {
                    message = "Bundle not found."
                });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BundleDto dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = result.BundleId },
                    result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id, [FromBody] BundleDto dto)
        {
            try
            {
                var updated = await _service.UpdateAsync(id, dto);

                if (!updated)
                    return NotFound(new
                    {
                        message = "Bundle not found."
                    });

                return Ok(new
                {
                    message = "Bundle updated successfully."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
                return NotFound(new
                {
                    message = "Bundle not found."
                });

            return Ok(new
            {
                message = "Bundle deleted successfully."
            });
        }
    }
}
