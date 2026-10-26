
using CompanyPlatform.CRM.DTO.BundleItem;

namespace CompanyPlatform.CRM.Services.BundleItem
{
    public interface IBundleItemService
    {
        Task<IEnumerable<BundleItemDto>> GetAllAsync();

        Task<BundleItemDto?> GetByIdAsync(int id);

        Task<BundleItemDto> CreateAsync(BundleItemDto dto);

        Task<bool> UpdateAsync(int id, BundleItemDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
