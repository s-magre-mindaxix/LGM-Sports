//using CompanyPlatform.Core.DTO.Enquiry;
//using CompanyPlatform.CRM.DTO.OrderAcceptance;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace CompanyPlatform.CRM.Services.OrderAcceptance
//{
//    public interface IOrderAcceptanceService
//    {
//        Task<List<OrderAcceptanceDto>> GetAllAsync();
//        Task<OrderAcceptanceDto> GetByIdAsync(int id);
//        Task<int> CreateAsync(OrderAcceptanceDto dto);
//        Task<bool> UpdateAsync(OrderAcceptanceDto dto);
//        Task<bool> DeleteAsync(int id);
//        Task<List<SelectOptionDto>> GetFinalOffersAsync(); // To populate dropdown
//        Task<string> GetNextOANumberAsync(); // To show on form load
//    }
//}


using CompanyPlatform.CRM.DTO.OrderAcceptance;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.OrderAcceptance
{
    public interface IOrderAcceptanceService
    {
        Task<List<OrderAcceptanceDto>> GetAllAsync();
        Task<OrderAcceptanceDto> GetByIdAsync(int id);
        Task<int> CreateAsync(OrderAcceptanceDto dto);
        Task<bool> UpdateAsync(OrderAcceptanceDto dto);
        Task<bool> DeleteAsync(int id);

        Task<List<OfferSelectionDto>> GetFinalOffersAsync();
        Task<List<OfferSelectionDto>> GetFinalServiceOffersAsync();

        Task<string> GetNextOANumberAsync();

        Task<OrderAcceptanceDto> GetAggregatedOfferDataAsync(List<int> offerIds);
    }
}
