using CompanyPlatform.Core.DTOs.Inventory;

namespace CompanyPlatform.Core.Interfaces.Inventory
{
    public interface IUnitService
    {
        Task<IEnumerable<UnitDto>> GetAllAsync();

        Task<UnitDto?> GetByIdAsync(int id);

        Task<UnitDto> CreateAsync(UnitDto unitDto);

        Task<UnitDto?> UpdateAsync(int id, UnitDto unitDto);

        Task<bool> DeleteAsync(int id);
    }
}