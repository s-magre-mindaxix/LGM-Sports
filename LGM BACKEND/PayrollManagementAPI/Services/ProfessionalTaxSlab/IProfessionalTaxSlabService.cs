using PayrollManagementAPI.DTO.ProfessionalTaxSlab;

namespace PayrollManagementAPI.Services.ProfessionalTaxSlab
{
    public interface IProfessionalTaxSlabService
    {
        Task<IEnumerable<ProfessionalTaxSlabDto>> GetAllAsync();
        Task<ProfessionalTaxSlabDto> GetByIdAsync(int id);
        Task<ProfessionalTaxSlabDto> CreateAsync(ProfessionalTaxSlabDto dto);
        Task<bool> UpdateAsync(int id, ProfessionalTaxSlabDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
