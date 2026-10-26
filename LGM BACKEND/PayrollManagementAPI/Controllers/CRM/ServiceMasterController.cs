using CompanyPlatform.CRM.DTO.ServiceMaster;
using CompanyPlatform.CRM.Services.ServiceMaster;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceMasterController : ControllerBase
    {
        private readonly IServiceMasterService _service;
        public ServiceMasterController(IServiceMasterService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) => Ok(await _service.GetByIdAsync(id));

        [HttpPost]
        public async Task<IActionResult> Create(ServiceMasterDto dto) => Ok(await _service.CreateAsync(dto));

        [HttpPut]
        public async Task<IActionResult> Update(ServiceMasterDto dto) => Ok(await _service.UpdateAsync(dto));

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) => Ok(await _service.DeleteAsync(id));
    }
}
