using CompanyPlatform.CRM.DTO.ServiceMaster;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.ServiceMaster
{
    public interface IServiceMasterService
    {
        Task<List<ServiceMasterDto>> GetAllAsync();
        Task<ServiceMasterDto> GetByIdAsync(int id);
        Task<int> CreateAsync(ServiceMasterDto dto);
        Task<bool> UpdateAsync(ServiceMasterDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
