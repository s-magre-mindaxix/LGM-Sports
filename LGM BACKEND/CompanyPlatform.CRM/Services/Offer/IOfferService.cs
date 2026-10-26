using CompanyPlatform.Core.DTO.Enquiry;
using CompanyPlatform.CRM.DTO.Offer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Offer
{
    public interface IOfferService
    {
        Task<List<OfferDto>> GetAllAsync();
        Task<OfferDto> GetByIdAsync(int id);
        Task<int> CreateAsync(OfferDto dto);
        Task<bool> UpdateAsync(OfferDto dto);
        Task<bool> DeleteAsync(int id);
        Task<List<SelectOptionDto>> GetFinalEnquiriesAsync();
        Task<List<SelectOptionDto>> GetFinalServicesAsync();
        Task<bool> HasDraftStatusAsync(int offerId);
        //Task<List<SelectOptionDto>> GetFinalServicesAsync();
    }
}
