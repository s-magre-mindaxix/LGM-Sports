
using CompanyPlatform.CRM.DTOs;
using CompanyPlatform.CRM.Services.AccessoryPrice;
//using CompanyPlatform.CRM.Services.Accessoryrice;
using Microsoft.AspNetCore.Mvc;


namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccessoryPriceController : ControllerBase
    {
        private readonly IAccessoryPriceService _service;

        public AccessoryPriceController(
            IAccessoryPriceService service)
        {
            _service = service;
        }

        // GET: api/AccessoryPrice
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/AccessoryPrice/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            if (result == null)
                return NotFound(new
                {
                    message = "Accessory price not found."
                });

            return Ok(result);
        }

        // POST: api/AccessoryPrice
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] AccessoryPriceDto dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = result.AccessoryPriceId },
                    result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/AccessoryPrice/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] AccessoryPriceDto dto)
        {
            try
            {
                var updated = await _service.UpdateAsync(id, dto);

                if (!updated)
                    return NotFound(new
                    {
                        message = "Accessory price not found."
                    });

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/AccessoryPrice/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
                return NotFound(new
                {
                    message = "Accessory price not found."
                });

            return NoContent();
        }
    }
}
