using CompanyPlatform.Core.DTO.DummyInvoice;
using CompanyPlatform.CRM.DTO.Invoice;
using CompanyPlatform.CRM.Services.Invoice;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;

        public InvoiceController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveInvoice([FromBody] SaveInvoiceDTO dto)
        {
            try
            {
                var id = await _invoiceService.SaveInvoiceAsync(dto);

                return Ok(new
                {
                    message = "Invoice saved successfully",
                    invoiceId = id
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAllInvoices()
        {
            var invoices = await _invoiceService.GetAllInvoicesAsync();
            return Ok(invoices);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoiceById(int id)
        {
            var invoice = await _invoiceService.GetInvoiceByIdAsync(id);

            if (invoice == null)
                return NotFound("Invoice not found");

            return Ok(invoice);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateInvoice([FromBody] SaveInvoiceDTO dto)
        {
            try
            {
                var id = await _invoiceService.UpdateInvoiceAsync(dto);

                return Ok(new
                {
                    message = "Invoice updated successfully",
                    invoiceId = id
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("pdf/{invoiceId}")]
        public async Task<IActionResult> GetInvoicePdf(int invoiceId)
        {
            var result = await _invoiceService.GetInvoiceForPdfAsync(invoiceId);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInvoice(int id)
        {
            var result = await _invoiceService.DeleteInvoiceAsync(id);

            if (!result)
                return NotFound();

            return Ok(new { message = "Invoice deleted successfully" });
        }

        [HttpGet("active-order-acceptances")]
        public async Task<IActionResult> GetActiveOrderAcceptances()
        {
            // Assuming you have an IOrderAcceptanceService injected
            var result = await _invoiceService.GetActiveOrderAcceptancesForInvoiceAsync();
            return Ok(result);
        }

        // GET: api/Invoice/from-order-acceptance/5
        [HttpGet("from-order-acceptance/{id}")]
        public async Task<IActionResult> GetDataFromOrderAcceptance(int id)
        {
            var result = await _invoiceService.GetDataFromOrderAcceptanceAsync(id);
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpGet("{id}/for-dummy-invoice")]
        public async Task<IActionResult> GetDataForFinalDummyInvoice(int id)
        {
            var dto = await _invoiceService.GetDataForFinalDummyInvoiceAsync(id);
            if (dto == null) return NotFound();
            return Ok(dto);
        }

        [HttpPost("create-final-dummy-invoice")]
        public async Task<IActionResult> CreateFinalDummyInvoice([FromBody] FinalDummyInvoiceDto dto)
        {
            var id = await _invoiceService.CreateFinalDummyInvoiceAsync(dto);
            return Ok(new { FinalDummyInvoiceId = id });
        }

        [HttpGet("get-all-final-dummy")]
        public async Task<IActionResult> GetAllFinalDummyInvoices()
        {
            var list = await _invoiceService.GetAllFinalDummyInvoicesAsync();
            return Ok(list);
        }

        [HttpGet("has-final-dummy/{id}")]
        public async Task<IActionResult> CheckFinalDummyExists(int id)
        {
            var exists = await _invoiceService.CheckFinalDummyExistsAsync(id);
            return Ok(exists);
        }

        [HttpGet("dummy-invoice-pdf/{id}")]
        public async Task<IActionResult> GetDummyInvoicePdf(int id)
        {
            var pdfData = await _invoiceService.GetDummyInvoiceForPdfAsync(id);

            if (pdfData == null)
            {
                return NotFound($"Dummy invoice with ID {id} not found.");
            }

            return Ok(pdfData);
        }

        [HttpGet("service-report-serials")]
        public async Task<IActionResult> GetServiceReportSerialNumbers()
        {
            var result = await _invoiceService.GetServiceReportSerialNumbersAsync();
            return Ok(result);
        }

        [HttpGet("service-report/{serviceReportId}")]
        public async Task<IActionResult> GetDataFromServiceReport(int serviceReportId)
        {
            var result = await _invoiceService.GetDataFromServiceReportAsync(serviceReportId);

            if (result == null)
                return NotFound();

            return Ok(result);
        }


        [HttpGet("proforma-dropdown")]
        public async Task<IActionResult> GetActiveProformaInvoices()
        {
            var result = await _invoiceService.GetActiveProformaInvoicesAsync();
            return Ok(result);
        }

        [HttpGet("from-proforma/{id}")]
        public async Task<IActionResult> GetDataFromProforma(int id)
        {
            var result = await _invoiceService.GetDataFromProformaInvoiceAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("export-excel/{invoiceId}")]
        public async Task<IActionResult> ExportExcel(int invoiceId)
        {
            var fileBytes = await _invoiceService.ExportInvoiceExcelAsync(invoiceId);

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"Invoice_{invoiceId}.xlsx");
        }
    }
}
