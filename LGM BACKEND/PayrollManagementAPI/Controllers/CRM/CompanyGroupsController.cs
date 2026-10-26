using CompanyPlatform.Core.DTO.CompanyGroupDto;
using CompanyPlatform.Core.Services.CompanyGroup;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyGroupsController : ControllerBase
    {
        private readonly ICompanyGroupService _service;

        public CompanyGroupsController(ICompanyGroupService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Group not found" });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CompanyGroupDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _service.CreateAsync(dto);
            return Ok(new { message = "Company Group created successfully" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] CompanyGroupDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            dto.Id = id;
            var updated = await _service.UpdateAsync(dto);

            if (!updated) return NotFound(new { message = "Group not found" });

            return Ok(new { message = "Company Group updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound(new { message = "Group not found" });

            return Ok(new { message = "Company Group deleted successfully" });
        }
    }
}
