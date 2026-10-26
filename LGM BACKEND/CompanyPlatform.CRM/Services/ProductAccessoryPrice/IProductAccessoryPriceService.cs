
using CompanyPlatform.CRM.DTO.ProductAccessoryPrice;

namespace CompanyPlatform.CRM.Services.ProductAccessoryPrice
{
    public interface IProductAccessoryPriceService
    {
        Task<IEnumerable<ProductAccessoryPriceDto>> GetAllAsync();

        Task<ProductAccessoryPriceDto?> GetByIdAsync(int id);

        Task<ProductAccessoryPriceDto> CreateAsync(
            ProductAccessoryPriceDto dto);

        Task<bool> UpdateAsync(
            int id, ProductAccessoryPriceDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
