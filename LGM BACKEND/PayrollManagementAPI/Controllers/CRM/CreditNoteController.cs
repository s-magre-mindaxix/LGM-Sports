using CompanyPlatform.CRM.DTO.CreditNote;
using CompanyPlatform.CRM.Services.CreditNote;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class CreditNoteController : ControllerBase
    {
        private readonly ICreditNoteService _creditNoteService;

        public CreditNoteController(ICreditNoteService creditNoteService)
        {
            _creditNoteService = creditNoteService;
        }

        [HttpGet("GetInvoiceDropdown")]
        public async Task<IActionResult> GetInvoiceDropdown()
        {
            var result = await _creditNoteService.GetInvoiceDropdownAsync();

            return Ok(result);
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            return Ok(
                await _creditNoteService.GetAllAsync());
        }

        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result =
                await _creditNoteService.GetByIdAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("GetInvoiceForCreditNote/{invoiceId}")]
        public async Task<IActionResult> GetInvoiceForCreditNote(
            int invoiceId)
        {
            var result =
                await _creditNoteService
                    .GetInvoiceForCreditNoteAsync(invoiceId);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create(
            [FromBody] CreateCreditNoteDto dto)
        {
            var id =
                await _creditNoteService.CreateAsync(dto);

            return Ok(new
            {
                Message = "Credit Note Created Successfully",
                CreditNoteId = id
            });
        }

        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] CreateCreditNoteDto dto)
        {
            var result =
                await _creditNoteService
                    .UpdateAsync(id, dto);

            if (!result)
                return NotFound();

            return Ok(new
            {
                Message = "Updated Successfully"
            });
        }

        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result =
                await _creditNoteService
                    .DeleteAsync(id);

            if (!result)
                return NotFound();

            return Ok(new
            {
                Message = "Deleted Successfully"
            });
        }

        [HttpGet("download-excel/{id}")]
        public async Task<IActionResult> DownloadExcel(int id)
        {
            var fileBytes =
                await _creditNoteService.DownloadExcelAsync(id);

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"CreditNote_{id}.xlsx");
        }

        [HttpGet("pdf/{id}")]
        public async Task<IActionResult> GetCreditNotePdf(int id)
        {
            var result = await _creditNoteService.GetCreditNotePdfAsync(id);

            if (result == null)
                return NotFound(new
                {
                    Success = false,
                    Message = "Credit Note not found"
                });

            return Ok(new
            {
                Success = true,
                Data = result
            });
        }

        [HttpGet("GetLastCreditNoteNo")]
        public async Task<IActionResult> GetLastCreditNoteNo()
        {
            var number = await _creditNoteService.GetLastCreditNoteNoAsync();

            return Ok(number);
        }
    }
}
