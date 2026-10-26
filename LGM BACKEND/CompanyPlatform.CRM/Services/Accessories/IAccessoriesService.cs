using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO.Accessories;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Accessories
{
    public interface IAccessoriesService
    {
        Task<List<AccessoriesDto>> GetAllAsync();

        Task<AccessoriesDto> GetByIdAsync(int id);

        // Create accessory using the DTO, including optional image upload
        Task<int> CreateAsync(AccessoriesDto dto);

        // Update accessory using the DTO, including optional image upload
        Task<bool> UpdateAsync(AccessoriesDto dto);

        Task<bool> DeleteAsync(int id);

        Task<string> GenerateAccessoryCode(
            int vendorId,
            string productSource);

        Task<List<AccessoryLog>> GetLogsAsync(int id);

        // Excel import continues to accept multipart/form-data
        Task ImportAccessoriesAsync(IFormFile file);
    }
}