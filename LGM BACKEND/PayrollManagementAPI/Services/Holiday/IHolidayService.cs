using PayrollManagementAPI.DTO.SalaryComponent;
using PayrollManagementAPI.DTO;

namespace PayrollManagementAPI.Services.Holiday
{
    public interface IHolidayService
    {
        Task<IEnumerable<HolidayDto>> GetAllAsync();
        Task<HolidayDto> GetByIdAsync(int id);
        Task<HolidayDto> CreateAsync(HolidayDto dto);
        Task<bool> UpdateAsync(int id, HolidayDto dto); 
        Task<bool> DeleteAsync(int id);

    }
}
