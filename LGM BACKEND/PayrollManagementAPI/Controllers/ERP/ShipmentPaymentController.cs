using CompanyPlatform.ERP.DTO.ShipmentPaymentDto;
using CompanyPlatform.ERP.Services.ShipmentPayment;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.ERP
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShipmentPaymentController : ControllerBase
    {
        private readonly IShipmentPaymentService _service;

        public ShipmentPaymentController(IShipmentPaymentService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateShipmentPaymentDto dto)
        {
            try
            {
                var id = await _service.CreateAsync(dto);

                return Ok(new
                {
                    Success = true,
                    Message = "Finance payment created successfully.",
                    ShipmentPaymentId = id
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();

            return Ok(result);
        }

        [HttpGet("eligible-transits")]
        public async Task<IActionResult> GetEligibleTransits()
        {
            var result = await _service.GetEligibleTransitsAsync();
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
        public async Task<IActionResult> Update(UpdateShipmentPaymentDto dto)
        {
            var updated = await _service.UpdateAsync(dto);

            if (!updated)
                return NotFound(new
                {
                    Success = false,
                    Message = "Record not found."
                });

            return Ok(new
            {
                Success = true,
                Message = "Finance payment updated successfully."
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
                return NotFound(new
                {
                    Success = false,
                    Message = "Record not found."
                });

            return Ok(new
            {
                Success = true,
                Message = "Finance payment deleted successfully."
            });
        }
    }
}
