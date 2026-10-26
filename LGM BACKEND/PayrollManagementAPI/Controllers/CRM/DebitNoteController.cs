using CompanyPlatform.CRM.DTO.DebitNote;
using CompanyPlatform.CRM.Services.DebitNote;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class DebitNoteController : ControllerBase
    {
        private readonly IDebitNoteService _debitNoteService;

        public DebitNoteController(
            IDebitNoteService debitNoteService)
        {
            _debitNoteService = debitNoteService;
        }

        [HttpGet("GetInvoiceDropdown")]
        public async Task<IActionResult> GetInvoiceDropdown()
        {
            return Ok(await _debitNoteService.GetInvoiceDropdownAsync());
        }

        [HttpGet("GetInvoiceForDebitNote/{invoiceId}")]
        public async Task<IActionResult> GetInvoiceForDebitNote(int invoiceId)
        {
            var result =await _debitNoteService.GetInvoiceForDebitNoteAsync(invoiceId);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _debitNoteService.GetAllAsync());
        }

        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _debitNoteService.GetByIdAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create(CreateDebitNoteDto dto)
        {
            var id = await _debitNoteService.CreateAsync(dto);

            return Ok(new
            {
                Message = "Debit Note Created Successfully",
                DebitNoteId = id
            });
        }

        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update(int id, CreateDebitNoteDto dto)
        {
            var result = await _debitNoteService.UpdateAsync(id, dto);

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
            var result = await _debitNoteService.DeleteAsync(id);

            if (!result)
                return NotFound();

            return Ok(new
            {
                Message = "Deleted Successfully"
            });
        }

        [HttpGet("GetDebitNotePdf/{debitNoteId}")]
        public async Task<IActionResult> GetDebitNotePdf(int debitNoteId)
        {
            var result = await _debitNoteService.GetDebitNotePdfAsync(debitNoteId);

            if (result == null)
                return NotFound(new
                {
                    Message = "Debit Note Not Found"
                });

            return Ok(result);
        }

        [HttpGet("DownloadExcel/{id}")]
        public async Task<IActionResult> DownloadExcel(int id)
        {
            var fileBytes = await _debitNoteService.GetDebitNoteExcelAsync(id);

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"DebitNote_{id}.xlsx");
        }

        [HttpGet("GetLastDebitNoteNo")]
        public async Task<IActionResult> GetLastDebitNoteNo()
        {
            var number =
                await _debitNoteService.GetLastDebitNoteNoAsync();

            return Ok(number);
        }
    }
}
