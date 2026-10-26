using CompanyPlatform.Core.DTO.ProductBarcode;

namespace CompanyPlatform.Core.Services.ProductBarcode
{
    public interface IProductBarcodeService
    {
        Task<List<ProductBarcodeDto>> GetAllAsync();

        Task<ProductBarcodeDto?> GetByIdAsync(int id);

        Task<ProductBarcodeDto> CreateAsync(ProductBarcodeDto dto);

        Task<bool> UpdateAsync(ProductBarcodeDto dto);

        Task<bool> DeleteAsync(int id);
    }
}