
using CompanyPlatform.CRM.DTO.Bundle;

namespace CompanyPlatform.CRM.Services.Bundle
{
    public interface IBundleService
    {
        Task<IEnumerable<BundleDto>> GetAllAsync();

        Task<BundleDto?> GetByIdAsync(int id);

        Task<BundleDto> CreateAsync(BundleDto dto);

        Task<bool> UpdateAsync(int id, BundleDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
