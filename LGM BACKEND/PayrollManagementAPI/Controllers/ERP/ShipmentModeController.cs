using CompanyPlatform.ERP.DTO.ShipmentModeDTO;
using CompanyPlatform.ERP.Services.ShipmentMode;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.ERP
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShipmentModeController : ControllerBase
    {
        private readonly IShipmentModeService _shipmentModeService;

        public ShipmentModeController(IShipmentModeService shipmentModeService)
        {
            _shipmentModeService = shipmentModeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _shipmentModeService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]

        public async Task<IActionResult> GetById(int id)
        {
            var result = await _shipmentModeService.GetByIdAsync(id);
            if (result == null)
                return NotFound(new { message = $"Shipment Mode with ID {id} not found." });

            return Ok(result);
        }

        [HttpPost]

        public async Task<IActionResult> Create(CreateShipmentModeDto dto)
        {
            var result = await _shipmentModeService.CreateAsync(dto);
            if (result == "Shipment Mode already exists.")
                return BadRequest(new { message = result });

            return Ok(new { message = result });
        }

        [HttpPut]

        public async Task<IActionResult> Update(UpdateShipmentModeDto dto)
        {
            var result = await _shipmentModeService.UpdateAsync(dto);
            if (result == "Shipment Mode not found.")
                return NotFound(new { message = result });

            if (result == "Shipment Mode already exists.")
                return BadRequest(new { message = result });

            return Ok(new { message = result });
        }

        [HttpDelete("{id}")]

        public async Task<IActionResult> Delete(int id)
        {
            var result = await _shipmentModeService.DeleteAsync(id);
            if (result == "Shipment Mode not found.")
                return NotFound(new { message = result });

            return Ok(new { message = result });
        }
    }
}
