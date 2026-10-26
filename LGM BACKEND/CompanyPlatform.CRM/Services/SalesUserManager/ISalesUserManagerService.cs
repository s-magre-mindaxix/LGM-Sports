using CompanyPlatform.CRM.DTO.SalesUserManager;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.SalesUserManager
{
    public interface ISalesUserManagerService
    {
        Task<IEnumerable<SalesUserManagerDto>> GetAllSalesUserManagersAsync();

        Task<SalesUserManagerDto> GetSalesUserManagerByIdAsync(int id);

        Task<SalesUserManagerDto> CreateSalesUserManagerAsync(
            SalesUserManagerDto dto);

        Task<bool> UpdateSalesUserManagerAsync(
            int id,
            SalesUserManagerDto dto);

        Task<bool> DeleteSalesUserManagerAsync(int id);
    }
}