using CompanyPlatform.CRM.DTO.Reason;
using CompanyPlatform.CRM.Services.Reason;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReasonController : ControllerBase
    {
        private readonly IReasonService _reasonService;

        public ReasonController(IReasonService reasonService)
        {
            _reasonService = reasonService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reasons = await _reasonService.GetAllAsync();
            return Ok(reasons);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var reason = await _reasonService.GetByIdAsync(id);

            if (reason == null)
                return NotFound(new { message = "Reason not found." });

            return Ok(reason);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReasonDto dto)
        {
            try
            {
                var created = await _reasonService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById),
                    new { id = created.ReasonId }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ReasonDto dto)
        {
            try
            {
                var updated = await _reasonService.UpdateAsync(id, dto);

                if (!updated)
                    return NotFound(new { message = "Reason not found." });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _reasonService.DeleteAsync(id);

            if (!deleted)
                return NotFound(new { message = "Reason not found." });

            return NoContent();
        }
    }
}