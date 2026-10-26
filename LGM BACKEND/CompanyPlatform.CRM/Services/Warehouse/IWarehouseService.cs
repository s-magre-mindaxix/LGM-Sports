using CompanyPlatform.Core.DTOs.Inventory;

namespace CompanyPlatform.Core.Interfaces.Inventory
{
    public interface IWarehouseService
    {
        Task<IEnumerable<WarehouseDto>> GetAllAsync();

        Task<WarehouseDto?> GetByIdAsync(int id);

        Task<WarehouseDto> CreateAsync(WarehouseDto warehouseDto);

        Task<WarehouseDto?> UpdateAsync(
            int id,
            WarehouseDto warehouseDto);

        Task<bool> DeleteAsync(int id);
    }
}