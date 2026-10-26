
using CompanyPlatform.Core.DTO.CRM.Supplier;
using CompanyPlatform.Core.Services.CRM;
using Microsoft.AspNetCore.Mvc;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierController : ControllerBase
    {
        private readonly ISupplierService _supplierService;

        public SupplierController(ISupplierService supplierService)
        {
            _supplierService = supplierService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _supplierService.GetAllAsync());
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var supplier = await _supplierService.GetByIdAsync(id);

            if (supplier == null)
                return NotFound(new { message = "Supplier not found." });

            return Ok(supplier);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateSupplierDto dto)
        {
            try
            {
                var supplier = await _supplierService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = supplier.SupplierId },
                    supplier);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateSupplierDto dto)
        {
            try
            {
                var supplier = await _supplierService.UpdateAsync(id, dto);

                if (supplier == null)
                    return NotFound(new { message = "Supplier not found." });

                return Ok(supplier);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _supplierService.DeleteAsync(id);

            if (!deleted)
                return NotFound(new { message = "Supplier not found." });

            return Ok(new
            {
                message = "Supplier soft-deleted successfully."
            });
        }
    }
}
