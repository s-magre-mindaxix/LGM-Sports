using CompanyPlatform.Core.DTO.CompanyGroupDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.CompanyGroup
{
    public interface ICompanyGroupService
    {
        Task<List<CompanyGroupDto>> GetAllAsync();
        Task<CompanyGroupDto> GetByIdAsync(int id);
        Task<CompanyGroupDto> CreateAsync(CompanyGroupDto dto);
        Task<bool> UpdateAsync(CompanyGroupDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
