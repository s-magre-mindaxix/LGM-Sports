
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTOs.Inventory;
using CompanyPlatform.Core.Interfaces.Inventory;
using CompanyPlatform.Core.Models.Inventory;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Services.Inventory
{
    public class LocationService : ILocationService
    {
        private readonly ApplicationDBContext _context;

        public LocationService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LocationDto>> GetAllAsync()
        {
            return await _context.Locations
                .AsNoTracking()
                .Where(l => !l.IsDeleted)
                .Select(l => new LocationDto
                {
                    LocationId = l.LocationId,
                    WarehouseId = l.WarehouseId,
                    LocationCode = l.LocationCode,
                    Zone = l.Zone,
                    Rack = l.Rack,
                    Shelf = l.Shelf,
                    Bin = l.Bin,
                    IsActive = l.IsActive,
                    IsDeleted = l.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<LocationDto?> GetByIdAsync(int id)
        {
            return await _context.Locations
                .AsNoTracking()
                .Where(l => l.LocationId == id && !l.IsDeleted)
                .Select(l => new LocationDto
                {
                    LocationId = l.LocationId,
                    WarehouseId = l.WarehouseId,
                    LocationCode = l.LocationCode,
                    Zone = l.Zone,
                    Rack = l.Rack,
                    Shelf = l.Shelf,
                    Bin = l.Bin,
                    IsActive = l.IsActive,
                    IsDeleted = l.IsDeleted
                })
                .FirstOrDefaultAsync();
        }

        public async Task<LocationDto> CreateAsync(
            LocationDto locationDto)
        {
            var warehouseExists = await _context.Warehouses
                .AnyAsync(w =>
                    w.WarehouseId == locationDto.WarehouseId &&
                    !w.IsDeleted);

            if (!warehouseExists)
            {
                throw new InvalidOperationException(
                    "The specified Warehouse does not exist or has been deleted."
                );
            }

            var location = new Location
            {
                WarehouseId = locationDto.WarehouseId,
                LocationCode = locationDto.LocationCode,
                Zone = locationDto.Zone,
                Rack = locationDto.Rack,
                Shelf = locationDto.Shelf,
                Bin = locationDto.Bin,
                IsActive = locationDto.IsActive,
                IsDeleted = false
            };

            _context.Locations.Add(location);

            await _context.SaveChangesAsync();

            locationDto.LocationId = location.LocationId;
            locationDto.IsDeleted = location.IsDeleted;

            return locationDto;
        }

        public async Task<LocationDto?> UpdateAsync(
            int id,
            LocationDto locationDto)
        {
            var location = await _context.Locations
                .FirstOrDefaultAsync(l =>
                    l.LocationId == id &&
                    !l.IsDeleted);

            if (location == null)
                return null;

            var warehouseExists = await _context.Warehouses
                .AnyAsync(w =>
                    w.WarehouseId == locationDto.WarehouseId &&
                    !w.IsDeleted);

            if (!warehouseExists)
            {
                throw new InvalidOperationException(
                    "The specified Warehouse does not exist or has been deleted."
                );
            }

            location.WarehouseId = locationDto.WarehouseId;
            location.LocationCode = locationDto.LocationCode;
            location.Zone = locationDto.Zone;
            location.Rack = locationDto.Rack;
            location.Shelf = locationDto.Shelf;
            location.Bin = locationDto.Bin;
            location.IsActive = locationDto.IsActive;

            await _context.SaveChangesAsync();

            locationDto.LocationId = location.LocationId;
            locationDto.IsDeleted = location.IsDeleted;

            return locationDto;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var location = await _context.Locations
                .FirstOrDefaultAsync(l =>
                    l.LocationId == id &&
                    !l.IsDeleted);

            if (location == null)
                return false;

            location.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
