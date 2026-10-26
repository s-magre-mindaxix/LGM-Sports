
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTOs.Inventory;
using CompanyPlatform.Core.Interfaces.Inventory;
using CompanyPlatform.Core.Models.Inventory;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Services.Inventory
{
    public class WarehouseService : IWarehouseService
    {
        private readonly ApplicationDBContext _context;

        public WarehouseService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<WarehouseDto>> GetAllAsync()
        {
            return await _context.Warehouses
                .AsNoTracking()
                .Where(w => !w.IsDeleted)
                .Select(w => new WarehouseDto
                {
                    WarehouseId = w.WarehouseId,
                    BranchId = w.BranchId,
                    WarehouseCode = w.WarehouseCode,
                    WarehouseName = w.WarehouseName,
                    Type = w.Type,
                    IsActive = w.IsActive,
                    IsDeleted = w.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<WarehouseDto?> GetByIdAsync(int id)
        {
            return await _context.Warehouses
                .AsNoTracking()
                .Where(w => w.WarehouseId == id && !w.IsDeleted)
                .Select(w => new WarehouseDto
                {
                    WarehouseId = w.WarehouseId,
                    BranchId = w.BranchId,
                    WarehouseCode = w.WarehouseCode,
                    WarehouseName = w.WarehouseName,
                    Type = w.Type,
                    IsActive = w.IsActive,
                    IsDeleted = w.IsDeleted
                })
                .FirstOrDefaultAsync();
        }

        public async Task<WarehouseDto> CreateAsync(
            WarehouseDto warehouseDto)
        {
            var branchExists = await _context.Branches
                .AnyAsync(b =>
                    b.BranchId == warehouseDto.BranchId &&
                    !b.IsDeleted);

            if (!branchExists)
            {
                throw new InvalidOperationException(
                    "The specified Branch does not exist or has been deleted."
                );
            }

            var warehouse = new Warehouse
            {
                BranchId = warehouseDto.BranchId,
                WarehouseCode = warehouseDto.WarehouseCode,
                WarehouseName = warehouseDto.WarehouseName,
                Type = warehouseDto.Type,
                IsActive = warehouseDto.IsActive,
                IsDeleted = false
            };

            _context.Warehouses.Add(warehouse);

            await _context.SaveChangesAsync();

            warehouseDto.WarehouseId = warehouse.WarehouseId;
            warehouseDto.IsDeleted = warehouse.IsDeleted;

            return warehouseDto;
        }

        public async Task<WarehouseDto?> UpdateAsync(
            int id,
            WarehouseDto warehouseDto)
        {
            var warehouse = await _context.Warehouses
                .FirstOrDefaultAsync(w =>
                    w.WarehouseId == id &&
                    !w.IsDeleted);

            if (warehouse == null)
                return null;

            var branchExists = await _context.Branches
                .AnyAsync(b =>
                    b.BranchId == warehouseDto.BranchId &&
                    !b.IsDeleted);

            if (!branchExists)
            {
                throw new InvalidOperationException(
                    "The specified Branch does not exist or has been deleted."
                );
            }

            warehouse.BranchId = warehouseDto.BranchId;
            warehouse.WarehouseCode = warehouseDto.WarehouseCode;
            warehouse.WarehouseName = warehouseDto.WarehouseName;
            warehouse.Type = warehouseDto.Type;
            warehouse.IsActive = warehouseDto.IsActive;

            await _context.SaveChangesAsync();

            warehouseDto.WarehouseId = warehouse.WarehouseId;
            warehouseDto.IsDeleted = warehouse.IsDeleted;

            return warehouseDto;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var warehouse = await _context.Warehouses
                .FirstOrDefaultAsync(w =>
                    w.WarehouseId == id &&
                    !w.IsDeleted);

            if (warehouse == null)
                return false;

            var hasLocations = await _context.Locations
                .AnyAsync(l => l.WarehouseId == id);

            if (hasLocations)
            {
                throw new InvalidOperationException(
                    "Cannot delete this Warehouse because it has associated Locations."
                );
            }

            warehouse.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
