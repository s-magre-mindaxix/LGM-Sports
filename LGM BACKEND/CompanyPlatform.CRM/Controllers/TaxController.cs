
using CompanyPlatform.Core.DTOs.Inventory;
using CompanyPlatform.Core.Interfaces.Inventory;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaxController : ControllerBase
    {
        private readonly ITaxService _taxService;

        public TaxController(ITaxService taxService)
        {
            _taxService = taxService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var taxes = await _taxService.GetAllAsync();

            return Ok(taxes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var tax = await _taxService.GetByIdAsync(id);

            if (tax == null)
            {
                return NotFound(new
                {
                    message = "Tax not found."
                });
            }

            return Ok(tax);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TaxDto taxDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var tax = await _taxService.CreateAsync(taxDto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = tax.TaxId },
                tax);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] TaxDto taxDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var tax = await _taxService.UpdateAsync(id, taxDto);

            if (tax == null)
            {
                return NotFound(new
                {
                    message = "Tax not found."
                });
            }

            return Ok(tax);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _taxService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Tax not found."
                });
            }

            return Ok(new
            {
                message = "Tax soft-deleted successfully."
            });
        }
    }
}
