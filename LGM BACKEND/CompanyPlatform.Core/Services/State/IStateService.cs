using CompanyPlatform.Core.DTO;

namespace CompanyPlatform.Core.Services.State
{
    public interface IStateService
    {
        Task<IEnumerable<StateDto>> GetAllAsync();
        Task<StateDto> GetByIdAsync(int id);
        Task<StateDto> CreateAsync(StateDto dto);
        Task<bool> UpdateAsync(int id, StateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
