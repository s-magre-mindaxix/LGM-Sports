using CompanyPlatform.ERP.DTO.ShipmentPaymentDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ShipmentPayment
{
    public interface IShipmentPaymentService
    {
        Task<int> CreateAsync(CreateShipmentPaymentDto dto);
        Task<List<ShipmentPaymentListDto>> GetAllAsync();

        Task<List<EligibleTransitDto>> GetEligibleTransitsAsync();
        Task<ShipmentPaymentDetailsDto?> GetByIdAsync(int id);
        Task<bool> UpdateAsync(UpdateShipmentPaymentDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
