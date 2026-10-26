using CompanyPlatform.ERP.DTO.ForwarderBillDto;
using CompanyPlatform.ERP.Services.ForwarderBill;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.ERP
{
    [Route("api/[controller]")]
    [ApiController]
    public class ForwarderBillController : ControllerBase
    {
        private readonly IForwarderBillService _service;

        public ForwarderBillController(IForwarderBillService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateForwarderBillDto dto)
        {
            return Ok(await _service.CreateAsync(dto));
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("eligible-shipments")]
        public async Task<IActionResult> GetEligibleShipments()
        {
            return Ok(await _service.GetEligibleShipmentsAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _service.GetByIdAsync(id));
        }

        [HttpPut]
        public async Task<IActionResult> Update(UpdateForwarderBillDto dto)
        {
            return Ok(await _service.UpdateAsync(dto));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return Ok(await _service.DeleteAsync(id));
        }


    }
}
