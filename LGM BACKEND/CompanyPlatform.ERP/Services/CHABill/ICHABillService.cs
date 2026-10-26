using CompanyPlatform.ERP.DTO.CHABillDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.CHABill
{
    public interface ICHABillService
    {
        Task<int> CreateAsync(CreateCHABillDto dto);

        Task<List<CHABillListDto>> GetAllAsync();

        Task<CHABillDetailsDto?> GetByIdAsync(int id);

        Task<bool> UpdateAsync(UpdateCHABillDto dto);

        Task<bool> DeleteAsync(int id);

        Task<List<EligibleShipmentDto>> GetEligibleShipmentsAsync();
    }
}
