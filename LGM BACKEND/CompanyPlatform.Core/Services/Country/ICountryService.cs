using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CompanyPlatform.Core.DTO;

namespace CompanyPlatform.Core.Services.Country
{
    public interface ICountryService
    {
        Task<IEnumerable<CountryDto>> GetAllAsync();
        Task<CountryDto> GetByIdAsync(int id);
        Task<CountryDto> CreateAsync(CountryDto dto);
        Task<bool> UpdateAsync(int id, CountryDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
