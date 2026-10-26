
using CompanyPlatform.CRM.DTO.BundleItem;
using CompanyPlatform.CRM.Services.BundleItem;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BundleItemController : ControllerBase
    {
        private readonly IBundleItemService _service;

        public BundleItemController(IBundleItemService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            if (result == null)
                return NotFound(new { message = "Bundle item not found." });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] BundleItemDto dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = result.BundleItemId },
                    result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id, [FromBody] BundleItemDto dto)
        {
            try
            {
                var updated = await _service.UpdateAsync(id, dto);

                if (!updated)
                    return NotFound(new { message = "Bundle item not found." });

                return Ok(new { message = "Bundle item updated successfully." });
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
                return NotFound(new { message = "Bundle item not found." });

            return Ok(new { message = "Bundle item deleted successfully." });
        }
    }
}
