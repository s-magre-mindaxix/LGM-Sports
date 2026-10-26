using CompanyPlatform.CRM.DTO.Product;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Product
{
    public interface IProductService
    {
        Task<List<ProductDto>> GetAllAsync();

        Task<ProductDto> GetByIdAsync(int id);

        Task<int> CreateAsync(ProductDto dto);

        Task<bool> UpdateAsync(ProductDto dto);

        Task<bool> DeleteAsync(int id);

        Task<string> GeneratePartNumber(
            int vendorId,
            int typeCode,
            int originCode);

        Task ImportProductsAsync(IFormFile file);
    }
}