using CompanyPlatform.Core.DTO.ProductType;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.ProductType
{
    public interface IProductTypeService
    {
        Task<List<ProductTypeDto>> GetAllAsync();
        Task<ProductTypeDto> CreateAsync(ProductTypeDto dto);
        Task<bool> UpdateAsync(ProductTypeDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
