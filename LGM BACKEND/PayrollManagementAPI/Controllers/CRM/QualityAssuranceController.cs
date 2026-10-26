using CompanyPlatform.CRM.DTO.Inventory;
using CompanyPlatform.CRM.Services.Inventory;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class QualityAssuranceController : ControllerBase
    {
        private readonly IQualityAssuranceService _service;
        public QualityAssuranceController(IQualityAssuranceService service) => _service = service;

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending() => Ok(await _service.GetPendingItemsAsync());

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory() => Ok(await _service.GetQAHistoryAsync());

        [HttpPut("update-status")]
        public async Task<IActionResult> UpdateStatus(QAStatusUpdateDto dto)
        {
            var result = await _service.UpdateQAStatusAsync(dto);
            return result ? Ok(new { message = "QA Status Updated and Stock Synced" }) : BadRequest();
        }
    }
}
