using CompanyPlatform.CRM.DTO.Reason;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Reason
{
    public interface IReasonService
    {
        Task<IEnumerable<ReasonDto>> GetAllAsync();
        Task<ReasonDto?> GetByIdAsync(int id);
        Task<ReasonDto> CreateAsync(ReasonDto dto);
        Task<bool> UpdateAsync(int id, ReasonDto dto);
        Task<bool> DeleteAsync(int id);
    }
}