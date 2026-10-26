using CompanyPlatform.ERP.DTO.ShipmentTypeDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ShipmentType
{
    public interface IShipmentTypeService
    {
        Task<List<ShipmentTypeDto>> GetAllAsync();

        Task<ShipmentTypeDto?> GetByIdAsync(int id);

        Task<string> CreateAsync(CreateShipmentTypeDto dto);

        Task<string> UpdateAsync(UpdateShipmentTypeDto dto);

        Task<string> DeleteAsync(int id);
    }
}
