using CompanyPlatform.ERP.DTO.AgencyDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.Agency
{
    public interface IAgencyService
    {
        Task<List<AgencyDto>> GetAllAsync();

        Task<AgencyDto> GetByIdAsync(int id);

        Task<AgencyDto> CreateAsync(AgencyDto dto);

        Task<bool> UpdateAsync(AgencyDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
