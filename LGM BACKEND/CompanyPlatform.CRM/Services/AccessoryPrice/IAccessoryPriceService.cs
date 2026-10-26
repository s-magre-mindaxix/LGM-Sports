using CompanyPlatform.CRM.DTOs;

namespace CompanyPlatform.CRM.Services.AccessoryPrice
{
    public interface IAccessoryPriceService
    {
        Task<IEnumerable<AccessoryPriceDto>> GetAllAsync();
        Task<AccessoryPriceDto?> GetByIdAsync(int id);
        Task<AccessoryPriceDto> CreateAsync(AccessoryPriceDto dto);
        Task<bool> UpdateAsync(int id, AccessoryPriceDto dto);
        Task<bool> DeleteAsync(int id);
    }
}