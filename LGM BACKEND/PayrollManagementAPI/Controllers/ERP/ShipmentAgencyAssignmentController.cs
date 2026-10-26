using CompanyPlatform.ERP.DTO.ShipmentItem;
using CompanyPlatform.ERP.Services.ShipmentAgencyAssignment;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.ERP
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShipmentAgencyAssignmentController : ControllerBase
    {
        private readonly IShipmentAgencyAssignmentService _service;

        public ShipmentAgencyAssignmentController(IShipmentAgencyAssignmentService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateShipmentAgencyAssignmentDto dto)
        {
            return Ok(await _service.CreateAsync(dto));
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("shipment/{shipmentId}")]
        public async Task<IActionResult> GetByShipmentId(int shipmentId)
        {
            return Ok(await _service.GetByShipmentIdAsync(shipmentId));
        }

        [HttpPut]
        public async Task<IActionResult> Update(UpdateShipmentAgencyAssignmentDto dto)
        {
            return Ok(await _service.UpdateAsync(dto));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return Ok(await _service.DeleteAsync(id));
        }

        [HttpGet("shipment-dropdown")]
        public async Task<IActionResult> GetShipmentDropdown()
        {
            var result = await _service.GetShipmentDropdownAsync();
            return Ok(result);
        }

        [HttpGet("shipment-details/{shipmentInitiateId}")]
        public async Task<IActionResult> GetShipmentDetails(int shipmentInitiateId)
        {
            var result = await _service.GetShipmentDetailsAsync(shipmentInitiateId);
            return Ok(result);
        }

        [HttpGet("GetAgencyDetails/{agencyId}")]
        public async Task<IActionResult> GetAgencyDetails(int agencyId)
        {
            return Ok(
                await _service.GetAgencyDetailsAsync(agencyId)
            );
        }

        [HttpPost("UploadAgencyDocument")]
        public async Task<IActionResult> UploadAgencyDocument([FromForm] UploadAgencyDocumentRequest request)

        {
            var result =
                await _service.SendAgencyDocumentAsync(request.AgencyId, request.ShipmentInitiateId, request.Documents);
            return Ok(result);
        }
    }
}
