using CompanyPlatform.ERP.DTO.AgencyTypeDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.AgencyType
{
    public interface IAgencyTypeService
    {
        Task<List<AgencyTypeDto>> GetAllAsync();

        Task<AgencyTypeDto?> GetByIdAsync(int id);

        Task<AgencyTypeDto> CreateAsync(CreateAgencyTypeDto dto);

        Task<bool> UpdateAsync(UpdateAgencyTypeDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
