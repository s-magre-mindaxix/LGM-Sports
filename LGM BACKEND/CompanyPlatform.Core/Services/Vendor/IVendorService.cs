using CompanyPlatform.Core.DTO.Vendor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.Vendor
{
    public interface IVendorService
    {
        Task<List<VendorDto>> GetAllAsync();
        Task<VendorDto> GetByIdAsync(int id);
        Task<VendorDto> CreateAsync(VendorDto dto);
        Task<bool> UpdateAsync(VendorDto dto);
        Task<bool> DeleteAsync(int id);

        Task<string> GenerateUniqueVendorCodeAsync();
    }
}
