using CompanyPlatform.ERP.DTO.ShipmentTypeDTO;
using CompanyPlatform.ERP.Services.ShipmentType;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.ERP
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShipmentTypeController : ControllerBase
    {
        private readonly IShipmentTypeService _service;

        public ShipmentTypeController(IShipmentTypeService service)
        {
            _service = service;
        }

        // GET ALL
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();

            return Ok(result);
        }

        // GET BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            if (result == null)
                return NotFound("Shipment Type not found.");

            return Ok(result);
        }

        // CREATE
        [HttpPost]
        public async Task<IActionResult> Create(CreateShipmentTypeDto dto)
        {
            var result = await _service.CreateAsync(dto);

            return Ok(result);
        }

        // UPDATE
        [HttpPut]
        public async Task<IActionResult> Update(UpdateShipmentTypeDto dto)
        {
            var result = await _service.UpdateAsync(dto);

            return Ok(result);
        }

        // DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            return Ok(result);
        }
    }
}
