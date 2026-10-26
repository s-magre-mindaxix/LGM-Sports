
using Microsoft.AspNetCore.Mvc;
using CompanyPlatform.CRM.Services.PurchaseOrder;
using CompanyPlatform.CRM.DTO.PurchaseOrder;
using System.Threading.Tasks;

namespace CompanyPlatform.API.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly IPurchaseOrderService _service;
        public PurchaseOrderController(IPurchaseOrderService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id) => Ok(await _service.GetByIdAsync(id));

        [HttpGet("next-number")]
        public async Task<IActionResult> GetNextNumber() => Ok(new { number = await _service.GetNextPONumberAsync() });

        [HttpGet("final-oas")]
        public async Task<IActionResult> GetFinalOAs() => Ok(await _service.GetFinalOAsAsync());


        [HttpGet("final-service-oas")]
        public async Task<IActionResult> GetFinalServiceOAs()
    => Ok(await _service.GetFinalServiceOAsAsync());

        [HttpPost]
        public async Task<IActionResult> Create(PurchaseOrderDto dto) => Ok(await _service.CreateAsync(dto));

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, PurchaseOrderDto dto)
        {
            if (id != dto.PurchaseOrderId) return BadRequest();
            return Ok(await _service.UpdateAsync(dto));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) => Ok(await _service.DeleteAsync(id));

        [HttpGet("pdf/{id}")]
        public async Task<IActionResult> GetPurchaseOrderPdf(int id)
        {
            try
            {
                var result = await _service.GetPurchaseOrderPdf(id);

                if (result == null)
                    return NotFound(new { message = "Purchase Order not found" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error generating Purchase Order PDF",
                    error = ex.Message
                });
            }
        }

        [HttpPost("data-from-oas")]
        public async Task<IActionResult> GetDataForPOFromOAs([FromBody] List<int> oaIds)
        {
            if (oaIds == null || !oaIds.Any())
            {
                return BadRequest("No Order Acceptance IDs provided.");
            }
            try
            {
                var result = await _service.GetDataForPOFromOAsAsync(oaIds);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching data from OAs", error = ex.Message });
            }
        }

    }
}