
using CompanyPlatform.CRM.DTO.ProductAccessoryRule;
using CompanyPlatform.CRM.Services.ProductAccessoryRule;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductAccessoryRuleController : ControllerBase
    {
        private readonly IProductAccessoryRuleService _service;

        public ProductAccessoryRuleController(
            IProductAccessoryRuleService service)
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
                return NotFound();

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] ProductAccessoryRuleDto dto)
        {
            try
            {
                var id = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id },
                    new { Id = id, Message = "Product-accessory rule created successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] ProductAccessoryRuleDto dto)
        {
            if (dto.Id != 0 && dto.Id != id)
                return BadRequest("Route ID and DTO ID do not match.");

            dto.Id = id;

            try
            {
                var updated = await _service.UpdateAsync(dto);

                if (!updated)
                    return NotFound();

                return Ok(new { Message = "Product-accessory rule updated successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
                return NotFound();

            return Ok(new { Message = "Product-accessory rule deleted successfully." });
        }
    }
}
