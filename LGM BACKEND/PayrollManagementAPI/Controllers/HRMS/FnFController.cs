using CompanyPlatform.Core.Models.HRMS;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.Services.FullandFinal;

namespace PayrollManagementAPI.Controllers.HRMS
{
    [Route("api/[controller]")]
    [ApiController]
    public class FnFController : ControllerBase
    {
        private readonly IFnFService _fnfService;

        public FnFController(IFnFService fnfService)
        {
            _fnfService = fnfService;
        }

        [HttpPost("preview")]
        public async Task<IActionResult> Preview(FnFPreviewRequest request)
        {
            var result = await _fnfService.CalculatePreview(request);
            return Ok(result);
        }

        [HttpPost("finalize")]
        public async Task<IActionResult> Finalize(FnFSettlement settlement)
        {
            try
            {
                var result = await _fnfService.Finalize(settlement);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing settlement.", error = ex.Message });
            }
        }
    }
}
