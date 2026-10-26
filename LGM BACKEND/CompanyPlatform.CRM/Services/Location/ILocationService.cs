using CompanyPlatform.Core.DTOs.Inventory;

namespace CompanyPlatform.Core.Interfaces.Inventory
{
    public interface ILocationService
    {
        Task<IEnumerable<LocationDto>> GetAllAsync();

        Task<LocationDto?> GetByIdAsync(int id);

        Task<LocationDto> CreateAsync(LocationDto locationDto);

        Task<LocationDto?> UpdateAsync(
            int id,
            LocationDto locationDto);

        Task<bool> DeleteAsync(int id);
    }
}