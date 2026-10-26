using CompanyPlatform.Core.DTO.DummyInvoice;
using CompanyPlatform.Core.DTO.ProformaInvoice;
using CompanyPlatform.CRM.Services.ProformaInvoice;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProformaInvoicesController : ControllerBase
    {
        private readonly IProformaInvoiceService _proformaInvoiceService;

        public ProformaInvoicesController(IProformaInvoiceService proformaInvoiceService)
        {
            _proformaInvoiceService = proformaInvoiceService;
        }

    
        [HttpGet("active-offers")]
        public async Task<IActionResult> GetActiveOffers()
        {
            var offers = await _proformaInvoiceService.GetActiveOffersAsync();
            return Ok(offers);
        }

     
        [HttpGet("from-offer/{offerId}")]
        public async Task<IActionResult> GetProformaDataFromOffer(int offerId)
        {
            if (offerId <= 0)
            {
                return BadRequest("Invalid Offer ID.");
            }

            var proformaData = await _proformaInvoiceService.GetDataFromOfferIdAsync(offerId);

            if (proformaData == null)
            {
                return NotFound($"No data found for Offer ID {offerId}.");
            }

            return Ok(proformaData);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProformaInvoice([FromBody] ProformaInvoiceDto proformaInvoiceDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newId = await _proformaInvoiceService.CreateAsync(proformaInvoiceDto);
            return CreatedAtAction(nameof(GetById), new { id = newId }, proformaInvoiceDto);
        }

        //[HttpGet("{id}")]
        //public async Task<IActionResult> GetById(int id)
        //{
          
        //    return Ok($"Endpoint to get Proforma Invoice with ID {id}");
        //}

        [HttpGet]
        public async Task<ActionResult<List<ProformaInvoiceListDto>>> GetAll()
        {
            try
            {
                var result = await _proformaInvoiceService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProformaInvoiceDto>> GetById(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("Invalid ID");

                var proformaInvoice = await _proformaInvoiceService.GetByIdAsync(id);

                if (proformaInvoice == null)
                {
                    return NotFound($"Proforma Invoice with ID {id} not found.");
                }

                return Ok(proformaInvoice);
            }
            catch (Exception ex)
            {
                // Log the exception (ex) here
                return StatusCode(500, "Internal Server Error while fetching Proforma Invoice.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProformaInvoiceDto dto)
        {
            if (id != dto.ProformaInvoiceId)
            {
                return BadRequest("ID Mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _proformaInvoiceService.UpdateAsync(id, dto);

            if (!success)
            {
                return NotFound($"Proforma Invoice with ID {id} not found.");
            }

            return NoContent(); 
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid ID.");
            }

            var success = await _proformaInvoiceService.DeleteAsync(id);

            if (!success)
            {
                return NotFound($"Proforma Invoice with ID {id} not found.");
            }

            return NoContent(); 
        }

        [HttpGet("{id}/pdf-details")]
        public async Task<IActionResult> GetPdfDetails(int id)
        {
            var pdfData = await _proformaInvoiceService.GetProformaInvoiceForPdfAsync(id);
            if (pdfData == null)
            {
                return NotFound();
            }
            return Ok(pdfData);
        }

        [HttpGet("{id}/for-dummy-invoice")]
        public async Task<IActionResult> GetDataForDummyInvoice(int id)
        {
            var data = await _proformaInvoiceService.GetDataForDummyInvoiceAsync(id);
            if (data == null)
            {
                return NotFound();
            }
            return Ok(data);
        }

        [HttpPost("create-dummy-invoice")]
        public async Task<IActionResult> CreateDummyInvoice([FromBody] DummyInvoiceDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var id = await _proformaInvoiceService.CreateDummyInvoiceAsync(dto);
            return Ok(new { id });
        }

        [HttpGet("GetAllDummy")]
        public async Task<IActionResult> GetAllDummyInvoices()
        {
            var dummyInvoices = await _proformaInvoiceService.GetAllDummyInvoicesAsync();
            return Ok(dummyInvoices);
        }

        [HttpPatch("toggle-status/{id}")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            try
            {
                var result = await _proformaInvoiceService.ToggleStatusAsync(id);

                if (result)
                {
                    return Ok(new { message = "Status updated successfully" });
                }

                return NotFound(new { message = "Invoice not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("has-dummy/{proformaInvoiceId}")]
        public async Task<IActionResult> HasDummyInvoice(int proformaInvoiceId)
        {
            var exists = await _proformaInvoiceService.HasDummyInvoiceAsync(proformaInvoiceId);
            return Ok(exists);
        }

        [HttpGet("{id}/dummy-pdf-details")]
   
        public async Task<IActionResult> GetDummyInvoicePdfDetails(int id)
        {
            var pdfDto = await _proformaInvoiceService.GetDummyInvoiceForPdfAsync(id);

            if (pdfDto == null)
            {
                return NotFound($"Dummy Invoice with ID {id} not found.");
            }

            return Ok(pdfDto);
        }

        [HttpGet("service-reports")]
        public async Task<IActionResult> GetServiceReportsDropdown()
        {
            var data = await _proformaInvoiceService.GetActiveServiceReportsAsync();
            return Ok(data);
        }

        [HttpGet("from-service/{serviceReportId}")]
        public async Task<IActionResult> GetFromService(int serviceReportId)
        {
            var data = await _proformaInvoiceService.GetDataFromServiceReportAsync(serviceReportId);

            if (data == null)
                return NotFound("Service Report not found");

            return Ok(data);
        }

        [HttpGet("download-excel/{id}")]
        public async Task<IActionResult> DownloadExcel(int id)
        {
            var bytes =
                await _proformaInvoiceService.GenerateExcelAsync(id);

            return File(
                bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"ProformaInvoice_{id}.xlsx");
        }
    }
}
