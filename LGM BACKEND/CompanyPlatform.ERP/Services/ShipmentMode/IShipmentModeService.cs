using CompanyPlatform.ERP.DTO.ShipmentModeDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ShipmentMode
{
    public interface IShipmentModeService
    {
        Task<List<ShipmentModeDto>> GetAllAsync();

        Task<ShipmentModeDto?> GetByIdAsync(int id);

        Task<string> CreateAsync(CreateShipmentModeDto dto);

        Task<string> UpdateAsync(UpdateShipmentModeDto dto);

        Task<string> DeleteAsync(int id);
    }
}
