using CompanyPlatform.ERP.DTO.ReportsDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.Reports
{
    public interface IShipmentReportService
    {
        Task<ShipmentLandedCostResponseDto> GetReportAsync();

        Task<List<ShipmentStatusReportDto>> GetShipmentStatusReportAsync();

        Task<List<ShipmentTransitStatusReportDto>> GetShipmentTransitStatusReportAsync();

    }
}
