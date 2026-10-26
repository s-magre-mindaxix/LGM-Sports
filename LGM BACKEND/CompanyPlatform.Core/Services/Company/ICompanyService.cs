
using CompanyPlatform.Core.DTO.Company;

namespace CompanyPlatform.Core.Services.Company
{
    public interface ICompanyService
    {
        Task<IEnumerable<CompanyListDto>> GetCompaniesAsync();

        Task<CompanyGetDto> GetCompanyAsync(int id);

        Task<CompanyDto> CreateCompanyAsync(CompanyDto dto);

        Task<bool> UpdateCompanyAsync(CompanyDto dto);

        Task SoftDeleteCompanyAsync(int id);

        Task AddAddressAsync(CompanyAddressDto dto);

        Task AddDirectorAsync(CompanyDirectorDto dto);

        Task AddBankAsync(CompanyBankDetailDto dto);

        Task<List<CompanyBankDetailDto>>
            GetBankDetailsByCompanyIdAsync(int companyId);

        Task<List<CompanyBankDetailDto>>
            GetAllBankDetailsAsync();
    }
}
