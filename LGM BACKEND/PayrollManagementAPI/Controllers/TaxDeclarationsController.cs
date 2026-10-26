using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO;
using PayrollManagementAPI.Services.TaxDeclarationService;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaxDeclarationsController : ControllerBase
    {
        private readonly ITaxDeclarationService _taxDeclarationService;

        public TaxDeclarationsController(ITaxDeclarationService taxDeclarationService)
        {
            _taxDeclarationService = taxDeclarationService;
        }

        [HttpGet("employee/{employeeId}/{financialYear}")]
        public async Task<IActionResult> GetDeclaration(int employeeId, string financialYear)
        {
            var declaration = await _taxDeclarationService.GetDeclarationAsync(employeeId, financialYear);
            if (declaration == null)
            {
                return NotFound(); 
            }
            return Ok(declaration);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrUpdateDeclaration([FromBody] TaxDeclarationDto declarationDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _taxDeclarationService.CreateOrUpdateDeclarationAsync(declarationDto);
            return Ok(result);
        }

        [HttpPut("{declarationId}/approve")]
        public async Task<IActionResult> ApproveDeclaration(int declarationId, [FromBody] List<DeclarationApprovalDto> approvalDtos)
        {
            try
            {
                await _taxDeclarationService.ApproveDeclarationDetailsAsync(declarationId, approvalDtos);
                return Ok(new { message = "Declaration approvals saved successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while saving approvals.");
            }
        }

        [HttpPost("details/{detailId}/documents")]
        public async Task<IActionResult> UploadDocument(int detailId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                var documentDto = await _taxDeclarationService.AddDocumentAsync(detailId, file);
                return Ok(documentDto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("documents/{documentId}")]
        public async Task<IActionResult> DeleteDocument(int documentId)
        {
            try
            {
                var success = await _taxDeclarationService.DeleteDocumentAsync(documentId);
                if (!success)
                {
                    return NotFound("Document not found.");
                }
                return NoContent(); // Success with no content to return
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

    }
}
