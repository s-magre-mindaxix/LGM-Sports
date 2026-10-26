using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.CRM.DTO.PaymentTerm;
using CompanyPlatform.CRM.Services.PaymentTerm;

namespace CompanyPlatform.CRM.Controllers
{
    [Route("api/payment-term")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class PaymentTermController : ControllerBase
    {
        private readonly IPaymentTermService _paymentTermService;
        private readonly ILogger<PaymentTermController> _logger;

        public PaymentTermController(
            IPaymentTermService paymentTermService,
            ILogger<PaymentTermController> logger)
        {
            _paymentTermService = paymentTermService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation(
                "Fetching all Payment Term records.");

            var paymentTerms =
                await _paymentTermService.GetAllPaymentTermsAsync();

            return Ok(paymentTerms);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation(
                "Fetching Payment Term with ID: {Id}",
                id);

            var paymentTerm =
                await _paymentTermService.GetPaymentTermByIdAsync(id);

            if (paymentTerm == null)
            {
                return NotFound(new
                {
                    Message = "Payment Term not found."
                });
            }

            return Ok(paymentTerm);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] PaymentTermDto paymentTermDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdPaymentTerm =
                await _paymentTermService
                    .CreatePaymentTermAsync(paymentTermDto);

            return Ok(createdPaymentTerm);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] PaymentTermDto paymentTermDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated =
                await _paymentTermService
                    .UpdatePaymentTermAsync(id, paymentTermDto);

            if (!updated)
            {
                return NotFound(new
                {
                    Message = "Payment Term not found."
                });
            }

            return Ok(new
            {
                Message = "Payment Term updated successfully."
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _paymentTermService
                    .DeletePaymentTermAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    Message = "Payment Term not found."
                });
            }

            return Ok(new
            {
                Message = "Payment Term deleted successfully."
            });
        }
    }
}