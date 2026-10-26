using CompanyPlatform.ERP.DTO.ShipmentItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ShipmentInitiate
{
    public interface IShipmentInitiateService
    {
        Task<List<ShipmentListDto>> GetAllAsync();

        Task<ShipmentInitiateDto?> GetByIdAsync(int id);

        Task<int> CreateAsync(ShipmentInitiateDto dto);

        Task<bool> UpdateAsync(ShipmentInitiateDto dto);

        Task<bool> DeleteAsync(int id);

        Task<List<ShipmentDropdownDto>>GetGBPOrderAcceptanceDropdownAsync();

        Task<List<ShipmentDropdownDto>>GetPurchaseOrderDropdownAsync();

        Task<ShipmentAutoFillDto?>GetOrderAcceptanceDetailsAsync(int oaId);

        Task<ShipmentAutoFillDto?>GetPurchaseOrderDetailsAsync(int poId);

        Task<string> GetNextShipmentNoAsync();
    }
}
