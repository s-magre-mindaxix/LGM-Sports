using CompanyPlatform.Core.DTO.ProductGroup;
using CompanyPlatform.Core.Services.ProductGroup;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.Commonmaster
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductGroupsController : ControllerBase
    {
        private readonly IProductGroupService _service;
        public ProductGroupsController(IProductGroupService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _service.GetAllAsync());

        [HttpPost]
        public async Task<IActionResult> Post(ProductGroupDto dto) => Ok(await _service.CreateAsync(dto));

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, ProductGroupDto dto)
        {
            dto.Id = id;
            return await _service.UpdateAsync(dto) ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) => Ok(await _service.DeleteAsync(id));
    }
}
