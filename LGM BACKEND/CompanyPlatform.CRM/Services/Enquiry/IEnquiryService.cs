using CompanyPlatform.Core.DTO.Enquiry;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Enquiry
{
    public interface IEnquiryService
    {
        Task<List<EnquiryListItemDto>> GetAllAsync();
        Task<EnquiryDto> GetByIdAsync(int id);
        Task<int> CreateAsync(EnquiryDto dto);
        Task<bool> UpdateAsync(EnquiryDto dto);
        Task<bool> DeleteAsync(int id);

        Task<string> GenerateEnquiryNoAsync(string entryType = "ENQUIRY");
    }
}
