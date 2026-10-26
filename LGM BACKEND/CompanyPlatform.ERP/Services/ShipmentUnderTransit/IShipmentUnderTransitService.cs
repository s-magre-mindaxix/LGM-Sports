using CompanyPlatform.ERP.DTO.ShipmentItem;
using CompanyPlatform.ERP.DTO.ShipmentUnderTransitDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ShipmentUnderTransit
{
    public interface IShipmentUnderTransitService
    {
        Task<int> CreateAsync(CreateShipmentUnderTransitDto dto);

        Task<List<ShipmentUnderTransitListDto>> GetAllAsync();

        Task<ShipmentUnderTransitDetailsDto?> GetByIdAsync(int id);

        Task<bool> UpdateAsync(UpdateShipmentUnderTransitDto dto);

        Task<bool> CloseShipmentAsync(int id);

        Task<bool> DeleteAsync(int id);

        Task<List<ShipmentDropdownDtos>> GetOpenShipmentDropdownAsync();

        Task<bool> AddToInventoryAsync(int shipmentUnderTransitId);
    }
}
