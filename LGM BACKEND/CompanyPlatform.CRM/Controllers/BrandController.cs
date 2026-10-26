
using CompanyPlatform.Core.DTOs.Inventory;
using CompanyPlatform.Core.Interfaces.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BrandController : ControllerBase
    {
        private readonly IBrandService _brandService;

        public BrandController(IBrandService brandService)
        {
            _brandService = brandService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var brands = await _brandService.GetAllAsync();

            return Ok(brands);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var brand = await _brandService.GetByIdAsync(id);

            if (brand == null)
            {
                return NotFound(new
                {
                    message = "Brand not found."
                });
            }

            return Ok(brand);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] BrandDto brandDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var brand = await _brandService.CreateAsync(brandDto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = brand.BrandId },
                brand);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] BrandDto brandDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var brand = await _brandService.UpdateAsync(
                id,
                brandDto);

            if (brand == null)
            {
                return NotFound(new
                {
                    message = "Brand not found."
                });
            }

            return Ok(brand);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _brandService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Brand not found."
                });
            }

            return Ok(new
            {
                message = "Brand soft-deleted successfully."
            });
        }
    }
}
