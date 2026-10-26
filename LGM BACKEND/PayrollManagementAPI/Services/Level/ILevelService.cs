using PayrollManagementAPI.DTO.Level;

namespace PayrollManagementAPI.Services.Level
{
    public interface ILevelService
    {
        Task<IEnumerable<LevelDto>> GetAllLevelsAsync();

        Task<LevelDto> GetLevelByIdAsync(int id);

        Task<LevelDto> CreateLevelAsync(CreateLevelDto dto);

        Task<LevelDto> UpdateLevelAsync(int id, UpdateLevelDto dto);

        Task<bool> DeleteLevelAsync(int id);
    }
}
