using CompanyPlatform.CRM.DTO.Industry;

namespace CompanyPlatform.CRM.Services.Industry
{
    public interface IIndustryService
    {
        Task<IEnumerable<IndustryDto>> GetAllIndustriesAsync();

        Task<IndustryDto> GetIndustryByIdAsync(int id);

        Task<IndustryDto> CreateIndustryAsync(IndustryDto industryDto);

        Task<bool> UpdateIndustryAsync(int id, IndustryDto industryDto);

        Task<bool> DeleteIndustryAsync(int id);
    }
}


//    public interface IIndustryService
//    {
//        Task<IEnumerable<IndustryDto>> GetAllIndustriesAsync();
//        Task<IndustryDto> GetIndustryByIdAsync(int id);
//        Task<IndustryDto> CreateIndustryAsync(IndustryDto industryDto);
//        Task<bool> UpdateIndustryAsync(int id, IndustryDto industryDto);
//        Task<bool> DeleteIndustryAsync(int id);
//    }
//}
