using CompanyPlatform.Core.DTO.ProductVariant;

namespace CompanyPlatform.Core.Services.ProductVariant
{
    public interface IProductVariantService
    {
        Task<List<ProductVariantDto>> GetAllAsync();
        Task<ProductVariantDto?> GetByIdAsync(int id);
        Task<ProductVariantDto> CreateAsync(ProductVariantDto dto);
        Task<bool> UpdateAsync(ProductVariantDto dto);
        Task<bool> DeleteAsync(int id);
    }
}