using CompanyPlatform.Core.DTO.ProductVersion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.ProductVersion
{
    public interface IProductVersionService
    {
        Task<List<ProductVersionDto>> GetAllAsync();
        Task<ProductVersionDto> CreateAsync(ProductVersionDto dto);
        Task<bool> UpdateAsync(ProductVersionDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
