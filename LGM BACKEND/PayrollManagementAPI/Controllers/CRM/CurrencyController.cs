using CompanyPlatform.CRM.DTO;
using CompanyPlatform.CRM.Services.Dashboards.Currency;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CurrencyController : ControllerBase
    {
        private readonly ICurrencyService _currencyService;
        private readonly IWiseRateService _wiseRateService;

        public CurrencyController(ICurrencyService currencyService, IWiseRateService wiseRateService)
        {
            _currencyService = currencyService;
            _wiseRateService = wiseRateService;
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] string code)
        {
            var result = await _currencyService.GetCurrencyHistoryAsync(code);
            return Ok(result);
        }

        [HttpPost("log")]
        public async Task<IActionResult> LogRate([FromBody] LogCurrencyRequest req)
        {
            await _currencyService.LogCurrencyRateAsync(req);
            return Ok();
        }

        [HttpGet("wise-rate")]
        public async Task<IActionResult> GetWiseRate(
            [FromQuery] string source,
            [FromQuery] string target,
            [FromServices] IWiseRateService wiseRateService)
        {
            if (string.IsNullOrWhiteSpace(source) || string.IsNullOrWhiteSpace(target))
                return BadRequest("Source and target are required.");

            var result = await wiseRateService.GetRateAsync(
                source.ToUpper(),
                target.ToUpper()
            );

            if (result == null)
                return NotFound("Rate not found.");

            return Ok(result);
        }

        [HttpGet("locked-rate")]
        public async Task<IActionResult> GetLockedRate(
            [FromQuery] string source,
            [FromQuery] string target = "INR"
        )
        {
            if (string.IsNullOrWhiteSpace(source) || string.IsNullOrWhiteSpace(target))
                return BadRequest("Source and target are required.");

            var rate = await _wiseRateService.GetLockedRateForTodayAsync(
                source.ToUpper(),
                target.ToUpper()
            );

            return Ok(new
            {
                source = source.ToUpper(),
                target = target.ToUpper(),
                rate = rate
            });
        }

        [HttpPut("update-today-rate")]
        public async Task<IActionResult> UpdateTodayRate([FromBody] LogCurrencyRequest request)
        {
            var result = await _currencyService.UpdateTodayCurrencyRateAsync(
                request.Code,
                request.Rate
            );

            if (!result)
                return BadRequest();

            return Ok(new { message = "Currency rate updated successfully" });
        }

    }
}
