using CompanyPlatform.Core.DTO.ProductVariant;
using CompanyPlatform.Core.Services.ProductVariant;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.Commonmaster
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductVariantsController : ControllerBase
    {
        private readonly IProductVariantService _service;

        public ProductVariantsController(IProductVariantService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var variant = await _service.GetByIdAsync(id);

            if (variant == null)
                return NotFound(new { message = "Product variant not found." });

            return Ok(variant);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ProductVariantDto dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = result.Id },
                    result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Put(int id, [FromBody] ProductVariantDto dto)
        {
            if (id != dto.Id && dto.Id != 0)
                return BadRequest(new { message = "Route ID does not match the variant ID." });

            dto.Id = id;

            try
            {
                var updated = await _service.UpdateAsync(dto);

                if (!updated)
                    return NotFound(new { message = "Product variant or product not found." });

                return Ok(new { message = "Product variant updated successfully." });
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
                return NotFound(new { message = "Product variant not found." });

            return Ok(new { message = "Product variant deleted successfully." });
        }
    }
}