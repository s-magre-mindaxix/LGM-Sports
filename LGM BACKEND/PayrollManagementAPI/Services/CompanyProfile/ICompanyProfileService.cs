using PayrollManagementAPI.DTO;
using CompanyPlatform.Core.DTO.Department;

namespace PayrollManagementAPI.Services.CompanyProfile
{
    public interface ICompanyProfileService
    {
        Task<IEnumerable<CompanyProfileDTO>> GetAllCompanyProfileAsync();
        Task<CompanyProfileDTO> GetCompanyProfileByIdAsync(int id);
        Task<CompanyProfileDTO> CreateCompanyProfileAsync(CompanyProfileDTO companyProfileDTO);
        Task<bool> UpdateCompanyProfiletAsync(int id, CompanyProfileDTO companyProfileDTO);
        Task<bool> DeletecompanyProfileAsync(int id);
    }
}
