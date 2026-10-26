using CompanyPlatform.CRM.DTOs;

namespace CompanyPlatform.CRM.Services
{
    public interface IProductPriceService
    {
        Task<IEnumerable<ProductPriceDto>> GetAllAsync();
        Task<ProductPriceDto?> GetByIdAsync(int id);
        Task<ProductPriceDto> CreateAsync(ProductPriceDto dto);
        Task<bool> UpdateAsync(int id, ProductPriceDto dto);
        Task<bool> DeleteAsync(int id);
    }
}