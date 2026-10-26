using CompanyPlatform.ERP.DTO.ReportsDTO;
using CompanyPlatform.ERP.Services.Reports;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace PayrollManagementAPI.Controllers.ERP
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShipmentReportController : ControllerBase
    {
        private readonly IShipmentReportService _reportService;

        public ShipmentReportController(IShipmentReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("shipment-landed-cost")]
        public async Task<IActionResult> GetShipmentLandedCostReport()
        {
            var result = await _reportService.GetReportAsync();

            return Ok(result);
        }

        [HttpGet("shipment-status")]
        public async Task<IActionResult> GetShipmentStatusReport()
        {
            var result = await _reportService.GetShipmentStatusReportAsync();

            return Ok(result);
        }

        [HttpGet("shipment-transit-status")]
        public async Task<IActionResult> GetShipmentTransitStatusReport()
        {
            var result = await _reportService.GetShipmentTransitStatusReportAsync();

            return Ok(result);
        }
    }
}
