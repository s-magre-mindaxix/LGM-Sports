using CompanyPlatform.Core.DTOs.Inventory;

namespace CompanyPlatform.Core.Interfaces.Inventory
{
    public interface IBrandService
    {
        Task<IEnumerable<BrandDto>> GetAllAsync();

        Task<BrandDto?> GetByIdAsync(int id);

        Task<BrandDto> CreateAsync(BrandDto brandDto);

        Task<BrandDto?> UpdateAsync(
            int id,
            BrandDto brandDto);

        Task<bool> DeleteAsync(int id);
    }
}