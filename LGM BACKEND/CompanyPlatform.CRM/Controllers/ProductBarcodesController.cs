
using CompanyPlatform.Core.DTO.ProductBarcode;
using CompanyPlatform.Core.Services.ProductBarcode;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.Commonmaster
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductBarcodesController : ControllerBase
    {
        private readonly IProductBarcodeService _service;

        public ProductBarcodesController(IProductBarcodeService service)
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
            {
                return NotFound(new
                {
                    message = "Product barcode not found."
                });
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] ProductBarcodeDto dto)
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
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] ProductBarcodeDto dto)
        {
            if (dto.Id != 0 && dto.Id != id)
            {
                return BadRequest(new
                {
                    message = "Route ID does not match barcode ID."
                });
            }

            dto.Id = id;

            try
            {
                var updated = await _service.UpdateAsync(dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        message = "Product barcode not found."
                    });
                }

                return Ok(new
                {
                    message = "Product barcode updated successfully."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Product barcode not found."
                });
            }

            return Ok(new
            {
                message = "Product barcode deleted successfully."
            });
        }
    }
}
