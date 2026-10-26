
using CompanyPlatform.Core.DTOs.Commonmaster;
using CompanyPlatform.Core.Services.Commonmaster;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.Core.Controllers.Commonmaster
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetAllAsync();
            return Ok(categories);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);

            if (category == null)
            {
                return NotFound(new
                {
                    message = "Category not found."
                });
            }

            return Ok(category);
        }

        // POST: api/Category
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CategoryCreateDto dto)
        {
            try
            {
                var category = await _categoryService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = category.CategoryId },
                    category);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/Category/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] CategoryUpdateDto dto)
        {
            try
            {
                var category = await _categoryService.UpdateAsync(id, dto);

                if (category == null)
                {
                    return NotFound(new
                    {
                        message = "Category not found."
                    });
                }

                return Ok(category);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/Category/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _categoryService.DeleteAsync(id);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        message = "Category not found."
                    });
                }

                return Ok(new
                {
                    message = "Category soft-deleted successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
