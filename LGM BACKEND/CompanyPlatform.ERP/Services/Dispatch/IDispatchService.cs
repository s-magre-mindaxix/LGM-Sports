using CompanyPlatform.ERP.DTO.DispatchDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.Dispatch
{
    public interface IDispatchService
    {
        Task<DispatchDto> CreateAsync(CreateDispatchDto dto);

        Task<List<DispatchDto>> GetAllAsync();

        Task<DispatchDto?> GetByIdAsync(int id);

        Task<bool> UpdateAsync(UpdateDispatchDto dto);

        Task<bool> DeleteAsync(int id);

        Task<List<DispatchShipmentDropdownDto>> GetShipmentDropdownAsync();

        Task<DispatchShipmentDetailsDto?> GetShipmentDetailsAsync(int shipmentInitiateId);
    }
}
