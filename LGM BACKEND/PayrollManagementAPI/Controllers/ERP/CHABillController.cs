using CompanyPlatform.ERP.DTO.CHABillDto;
using CompanyPlatform.ERP.Services.CHABill;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.ERP
{
    [Route("api/[controller]")]
    [ApiController]
    public class CHABillController : ControllerBase
    {
        private readonly ICHABillService _service;

        public CHABillController(ICHABillService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateCHABillDto dto)
        {
            var id = await _service.CreateAsync(dto);
            return Ok(id);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> Update(UpdateCHABillDto dto)
        {
            var result = await _service.UpdateAsync(dto);

            if (!result)
                return NotFound();

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            if (!result)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("eligible-shipments")]
        public async Task<IActionResult> GetEligibleShipments()
        {
            var result = await _service.GetEligibleShipmentsAsync();
            return Ok(result);
        }
    }
}
