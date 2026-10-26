using PayrollManagementAPI.DTO;

namespace PayrollManagementAPI.Services.StatutorySetting
{
    public interface IStatutorySettingService
    {
        Task<IEnumerable<StatutorySettingDto>> GetAllStatutorySettingsAsync();
        Task<StatutorySettingDto> GetStatutorySettingByIdAsync(int id);
        Task<StatutorySettingDto> CreateStatutorySettingAsync(StatutorySettingDto dto);
        Task<bool> UpdateStatutorySettingAsync(int id, StatutorySettingDto dto);
        Task DeleteStatutorySettingAsync(int id);
    }
}
