using CompanyPlatform.Core.DTO.PartCondition;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.PartCondition
{
    public interface IPartConditionService
    {
        Task<List<PartConditionDto>> GetAllAsync();
        Task<PartConditionDto> CreateAsync(PartConditionDto dto);
        Task<bool> UpdateAsync(PartConditionDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
