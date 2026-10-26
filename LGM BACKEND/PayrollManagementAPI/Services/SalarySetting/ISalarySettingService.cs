using PayrollManagementAPI.DTO;
using PayrollManagementAPI.DTO.SalaryComponent;

namespace PayrollManagementAPI.Services.SalarySetting
{
    public interface ISalarySettingService
    {
        Task<IEnumerable<SalarySettingPercentageDto>> GetAllSettingsAsync();
        Task<SalarySettingPercentageDto?> GetSettingByIdAsync(int id);
        Task<SalarySettingPercentageDto> CreateSettingAsync(SalarySettingPercentageCreateUpdateDto dto);
        Task<bool> UpdateSettingAsync(int id, SalarySettingPercentageCreateUpdateDto dto);
        Task<bool> DeleteSettingAsync(int id);

        Task<IEnumerable<SalaryComponentDtos>> GetEarningComponentsAsync();
    }
}
