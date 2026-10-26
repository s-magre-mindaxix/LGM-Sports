using CompanyPlatform.Core.DTO.ProductGroup;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.ProductGroup
{
    public interface IProductGroupService
    {
        Task<List<ProductGroupDto>> GetAllAsync();
        Task<ProductGroupDto> CreateAsync(ProductGroupDto dto);
        Task<bool> UpdateAsync(ProductGroupDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
