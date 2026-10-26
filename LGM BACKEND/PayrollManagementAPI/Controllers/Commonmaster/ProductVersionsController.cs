using CompanyPlatform.Core.DTO.ProductVersion;
using CompanyPlatform.Core.Services.ProductVersion;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.Commonmaster
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductVersionsController : ControllerBase
    {
        private readonly IProductVersionService _service;
        public ProductVersionsController(IProductVersionService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _service.GetAllAsync());

        [HttpPost]
        public async Task<IActionResult> Post(ProductVersionDto dto) => Ok(await _service.CreateAsync(dto));

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, ProductVersionDto dto)
        {
            dto.Id = id;
            return await _service.UpdateAsync(dto) ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) => Ok(await _service.DeleteAsync(id));
    }
}
