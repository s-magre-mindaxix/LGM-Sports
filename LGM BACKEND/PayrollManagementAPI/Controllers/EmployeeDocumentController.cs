using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.DTO.EmployeeDocuments;
using PayrollManagementAPI.Services.EmployeeDocument;
using PayrollManagementAPI.Services.EmployeeDocuments;
using System.Threading.Tasks;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/employee-documents")]
    [ApiController]
    [Authorize]
    public class EmployeeDocumentController : ControllerBase
    {
        private readonly IEmployeeDocumentService _service;
        private readonly ILogger<EmployeeDocumentController> _logger;

        public EmployeeDocumentController(IEmployeeDocumentService service, ILogger<EmployeeDocumentController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpPost("upload")]
        [Authorize]
        [RequestSizeLimit(268435456)]
        [RequestFormLimits(MultipartBodyLengthLimit = 268435456)]
        public async Task<IActionResult> Upload([FromForm] DocumentUploadDto dto)
        {
            _logger.LogInformation(
                "API endpoint called: Upload Document for EmployeeID: {EmployeeId}",
                dto.EmployeeID);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _service.UploadDocumentAsync(dto);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex,
                    "Error occurred during file upload for EmployeeID: {EmployeeId}",
                    dto.EmployeeID);

                return StatusCode(
                    500,
                    ex.InnerException?.Message ?? ex.Message
                );
            }
        }

        [HttpPut("update")]
        [Authorize]
        public async Task<IActionResult> UpdateDocument([FromForm] DocumentUpdateDto dto)
        {
            var result = await _service.UpdateDocumentAsync(dto);

            if (!result.Success)
                return NotFound(new { message = result.Message });

            return Ok(new { message = result.Message });
        }

        [HttpGet("by-employee/{employeeId}")]
        public async Task<IActionResult> GetByEmployeeId(int employeeId)
        {
            _logger.LogInformation("API endpoint called: Get Documents for EmployeeID: {EmployeeId}", employeeId);
            var documents = await _service.GetDocumentsByEmployeeIdAsync(employeeId);
            return Ok(documents);
        }

        [HttpGet("download/{documentId}")]
        public async Task<IActionResult> Download(int documentId)
        {
            _logger.LogInformation("API endpoint called: Download Document with ID: {DocumentId}", documentId);
            var result = await _service.GetDocumentForDownloadAsync(documentId);

            if (result == null)
            {
                return NotFound(new { message = $"Document with ID {documentId} not found." });
            }

            return File(result.Value.content, result.Value.contentType, result.Value.fileName);
        }

        [HttpDelete("{documentId}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Delete(int documentId)
        {
            _logger.LogInformation("API endpoint called: Delete Document with ID: {DocumentId}", documentId);
            var success = await _service.DeleteDocumentAsync(documentId);

            if (!success)
            {
                return NotFound(new { message = $"Document with ID {documentId} not found." });
            }

            return Ok(new { message = $"Document with ID {documentId} has been deleted successfully." });
        }

        [HttpPut("{documentId}/update-name")]
        [Authorize]
        public async Task<IActionResult> UpdateDocumentName(int documentId, [FromBody] UpdateDocumentNameDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _logger.LogInformation("API endpoint called: Update Document Name with ID: {DocumentId}", documentId);
            var success = await _service.UpdateDocumentNameAsync(documentId, dto.NewDocumentName);

            if (!success)
            {
                return NotFound(new { message = $"Document with ID {documentId} not found." });
            }

            return Ok(new { message = $"Document name updated successfully." });
        }
    }
}