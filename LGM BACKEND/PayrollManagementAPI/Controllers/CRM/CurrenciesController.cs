using CompanyPlatform.CRM.DTO.Currency;
using CompanyPlatform.CRM.Services.Dashboards.Currency;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class CurrenciesController : ControllerBase
    {
        private readonly ICurrencyService _service;
        public CurrenciesController(ICurrencyService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _service.GetAllAsync());

        [HttpPost]
        public async Task<IActionResult> Post(CurrencyDto dto) => Ok(await _service.CreateAsync(dto));

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, CurrencyDto dto)
        {
            dto.Id = id;
            return await _service.UpdateAsync(dto) ? Ok() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) => Ok(await _service.DeleteAsync(id));
    }
}
