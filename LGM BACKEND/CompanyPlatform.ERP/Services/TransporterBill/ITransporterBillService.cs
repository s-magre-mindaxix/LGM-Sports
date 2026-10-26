using CompanyPlatform.ERP.DTO.TransporterBillDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.TransporterBill
{
    public interface ITransporterBillService
    {
        Task<int> CreateAsync(CreateTransporterBillDto dto);

        Task<List<TransporterBillListDto>> GetAllAsync();

        Task<TransporterBillDetailsDto?> GetByIdAsync(int id);

        Task<bool> UpdateAsync(UpdateTransporterBillDto dto);

        Task<bool> DeleteAsync(int id);

        Task<List<EligibleShipmentDto>> GetEligibleShipmentsAsync();
    }
}
