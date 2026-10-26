using CompanyPlatform.ERP.DTO.ShipmentItem;
using CompanyPlatform.ERP.Services.ShipmentInitiate;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.ERP
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShipmentInitiateController : ControllerBase
    {
        private readonly IShipmentInitiateService _service;

        public ShipmentInitiateController(IShipmentInitiateService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok( await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var data =await _service.GetByIdAsync(id);

            if (data == null)
                return NotFound();

            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ShipmentInitiateDto dto)
        {
            var id = await _service.CreateAsync(dto);

            return Ok(new
            {
                ShipmentInitiateId = id
            });
        }

        [HttpPut]
        public async Task<IActionResult> Update(ShipmentInitiateDto dto)
        {
            var result =await _service.UpdateAsync(dto);

            if (!result)
                return NotFound();

            return Ok("Shipment Updated Successfully");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result =await _service.DeleteAsync(id);

            if (!result)
                return NotFound();

            return Ok("Shipment Deleted Successfully");
        }

        [HttpGet("oa-dropdown")]
        public async Task<IActionResult>GetGBPOrderAcceptanceDropdown()
        {
            return Ok(await _service.GetGBPOrderAcceptanceDropdownAsync());
        }

        [HttpGet("po-dropdown")]
        public async Task<IActionResult>GetPurchaseOrderDropdown()
        {
            return Ok(await _service.GetPurchaseOrderDropdownAsync());
        }

        [HttpGet("oa-details/{oaId}")]
        public async Task<IActionResult>GetOADetails(int oaId)
        {
            var result =await _service.GetOrderAcceptanceDetailsAsync(oaId);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("po-details/{poId}")]
        public async Task<IActionResult> GetPODetails(int poId)
        {
            var result = await _service.GetPurchaseOrderDetailsAsync(poId);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("next-shipment-no")]
        public async Task<IActionResult>GetNextShipmentNo()
        {
            return Ok(await _service.GetNextShipmentNoAsync());
        }
    }
}
