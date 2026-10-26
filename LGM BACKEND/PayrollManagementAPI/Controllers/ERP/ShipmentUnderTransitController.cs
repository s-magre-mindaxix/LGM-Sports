using CompanyPlatform.ERP.DTO.ShipmentUnderTransitDto;
using CompanyPlatform.ERP.Services.ShipmentUnderTransit;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.ERP
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShipmentUnderTransitController : ControllerBase
    {
        private readonly IShipmentUnderTransitService _service;

        public ShipmentUnderTransitController(
            IShipmentUnderTransitService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            CreateShipmentUnderTransitDto dto)
        {
            var id = await _service.CreateAsync(dto);

            return Ok(id);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            return Ok(await _service.GetByIdAsync(id));
        }

        [HttpPut]
        public async Task<IActionResult> Update(
            UpdateShipmentUnderTransitDto dto)
        {
            return Ok(await _service.UpdateAsync(dto));
        }

        [HttpPut("close/{id}")]
        public async Task<IActionResult> Close(int id)
        {
            return Ok(await _service.CloseShipmentAsync(id));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return Ok(await _service.DeleteAsync(id));
        }

        [HttpGet("shipment-dropdown")]
        public async Task<IActionResult> ShipmentDropdown()
        {
            return Ok(
                await _service.GetOpenShipmentDropdownAsync());
        }

        [HttpPost("add-to-inventory/{shipmentUnderTransitId}")]
        public async Task<IActionResult> AddToInventory(int shipmentUnderTransitId)
        {
            var result = await _service.AddToInventoryAsync(shipmentUnderTransitId);

            if (!result)
                return BadRequest();

            return Ok(new
            {
                message = "Inventory added to Quality Assurance successfully."
            });
        }
    }
}
