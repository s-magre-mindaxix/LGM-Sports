using CompanyPlatform.Core.DTO.Vendor;
using CompanyPlatform.Core.Services.Vendor;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VendorsController : ControllerBase
    {
        private readonly IVendorService _vendorService;

        public VendorsController(IVendorService vendorService)
        {
            _vendorService = vendorService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await _vendorService.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var vendorDto = await _vendorService.GetByIdAsync(id);

            if (vendorDto == null)
            {
                return NotFound(new { message = $"Vendor with ID {id} not found." });
            }

            return Ok(vendorDto);
        }

        //[HttpPost]
        //public async Task<IActionResult> Post([FromForm] VendorDto dto) 
        //{
        //    if (!ModelState.IsValid) return BadRequest(ModelState);
        //    try
        //    {
        //        var result = await _vendorService.CreateAsync(dto);
        //        return Ok(new { message = "Vendor data inserted successfully" });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { message = "Error saving vendor.", error = ex.Message });
        //    }
        //}

        [HttpPost]
        public async Task<IActionResult> Post([FromForm] VendorDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var result = await _vendorService.CreateAsync(dto);
                return Ok(new { message = "Vendor data inserted successfully" });
            }
            catch (Exception ex)
            {
                // Get the deepest message (the real error)
                var realError = ex.InnerException != null ? ex.InnerException.Message : ex.Message;

                // If there's an inner exception to the inner exception (common in EF)
                if (ex.InnerException?.InnerException != null)
                    realError = ex.InnerException.InnerException.Message;

                return StatusCode(500, new { message = "Error saving vendor.", error = realError });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromForm] VendorDto dto) // Changed to [FromForm]
        {
            dto.Id = id;
            var updated = await _vendorService.UpdateAsync(dto);
            if (!updated) return NotFound(new { message = $"Vendor with ID {id} not found." });

            return Ok(new { message = "Vendor data updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _vendorService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new { message = $"Vendor with ID {id} not found." });
            }

            // --- CHANGE IS HERE ---
            return Ok(new
            {
                message = "Vendor deleted successfully"
            });
        }

        [HttpGet("generate-code")]
        public async Task<IActionResult> GetGeneratedCode()
        {
            var code = await _vendorService.GenerateUniqueVendorCodeAsync();
            return Ok(code);
        }
    }
}
