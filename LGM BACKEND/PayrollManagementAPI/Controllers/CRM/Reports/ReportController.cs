using CompanyPlatform.CRM.DTO.Reports;
using CompanyPlatform.CRM.Services.Accessories;
using CompanyPlatform.CRM.Services.Reports;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM.Reports
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        //offer report
        [HttpPost("offer-report")]
        public async Task<IActionResult> GetOfferReport([FromBody] OfferReportDto filter)
        {
            var data = await _reportService.GetOfferReportAsync(filter);
            return Ok(data);
        }
        [HttpPut("update-offer-finalnote")]
        public async Task<IActionResult> UpdateOfferFinalNote(UpdateOfferFinalNoteDto dto)
        {
            var result = await _reportService.UpdateOfferFinalNoteAsync(dto);

            if (!result)
                return NotFound();

            return Ok(new
            {
                message = "Note updated successfully"
            });
        }

        //order acceptance report 

        [HttpPost("order-acceptance-report")]
        public async Task<IActionResult> GetOrderAcceptanceReport(
            [FromBody] OrderAcceptanceReportDto filter)
        {
            var result = await _reportService.GetOrderAcceptanceReportAsync(filter);
            return Ok(result);
        }

        [HttpPut("update-order-acceptance-finalnote")]
        public async Task<IActionResult> UpdateOrderAcceptanceFinalNote(UpdateOrderAcceptanceFinalNoteDto dto)
        {
            var result = await _reportService.UpdateOrderAcceptanceFinalNoteAsync(dto);

            if (!result)
                return NotFound();

            return Ok(new
            {
                message = "Note updated successfully"
            });
        }

        //purchase order report
        [HttpPost("purchase-order-report")]
        public async Task<IActionResult> GetPurchaseOrderReport([FromBody] PurchaseOrderReportDto filter)
        {
            var result = await _reportService.GetPurchaseOrderReportAsync(filter);
            return Ok(result);
        }
        [HttpPut("update-po-finalnote")]
        public async Task<IActionResult> UpdatePurchaseOrderFinalNote(UpdatePOFinalNoteDto dto)
        {
            var result = await _reportService.UpdatePOFinalNoteAsync(dto);

            if (!result)
                return NotFound();

            return Ok(new
            {
                message = "Note updated successfully"
            });
        }

        //proforma invoice report
        [HttpPost("proforma-invoice-report")]
        public async Task<IActionResult> GetProformaInvoiceReport([FromBody] ProformaInvoiceReportDto filter)
        {
            var result = await _reportService.GetProformaInvoiceReportAsync(filter);
            return Ok(result);
        }
        [HttpPut("update-proforma-invoice-finalnote")]
        public async Task<IActionResult> UpdateProformaInvoiceFinalNote(UpdateProformaInvoiceFinalNoteDto dto)
        {
            var result = await _reportService.UpdateProformaInvoiceFinalNoteAsync(dto);

            if (!result)
                return NotFound();

            return Ok(new
            {
                message = "Note updated successfully"
            });
        }

        //invoice report
        [HttpPost("invoice-report")]
        public async Task<IActionResult> GetInvoiceReport([FromBody] InvoiceReportDto filter)
        {
            var result = await _reportService.GetInvoiceReportAsync(filter);
            return Ok(result);
        }

        [HttpPut("update-invoice-finalnote")]
        public async Task<IActionResult> UpdateInvoiceFinalNote(UpdateInvoiceFinalNoteDto dto)
        {
            var result = await _reportService.UpdateInvoiceFinalNoteAsync(dto);

            if (!result)
                return NotFound();

            return Ok(new
            {
                message = "Note updated successfully"
            });
        }

    }
}
