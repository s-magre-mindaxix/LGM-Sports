using CompanyPlatform.ERP.DTO.ForwarderBillDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ForwarderBill
{
    public interface IForwarderBillService
    {
        Task<int> CreateAsync(CreateForwarderBillDto dto);

        Task<List<ForwarderBillListDto>> GetAllAsync();

        Task<ForwarderBillDetailsDto?> GetByIdAsync(int id);

        Task<bool> UpdateAsync(UpdateForwarderBillDto dto);

        Task<bool> DeleteAsync(int id);

        Task<List<EligibleShipmentDto>> GetEligibleShipmentsAsync();
    }
}
