
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTOs.Inventory;
using CompanyPlatform.Core.Interfaces.Inventory;
using CompanyPlatform.Core.Models.Inventory;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Services.Inventory
{
    public class UnitService : IUnitService
    {
        private readonly ApplicationDBContext _context;

        public UnitService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UnitDto>> GetAllAsync()
        {
            return await _context.Units
                .AsNoTracking()
                .Where(u => !u.IsDeleted)
                .Select(u => new UnitDto
                {
                    UnitId = u.UnitId,
                    UnitCode = u.UnitCode,
                    UnitName = u.UnitName,
                    DecimalAllowed = u.DecimalAllowed,
                    IsActive = u.IsActive,
                    IsDeleted = u.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<UnitDto?> GetByIdAsync(int id)
        {
            return await _context.Units
                .AsNoTracking()
                .Where(u => u.UnitId == id && !u.IsDeleted)
                .Select(u => new UnitDto
                {
                    UnitId = u.UnitId,
                    UnitCode = u.UnitCode,
                    UnitName = u.UnitName,
                    DecimalAllowed = u.DecimalAllowed,
                    IsActive = u.IsActive,
                    IsDeleted = u.IsDeleted
                })
                .FirstOrDefaultAsync();
        }

        public async Task<UnitDto> CreateAsync(UnitDto unitDto)
        {
            var unit = new Unit
            {
                UnitCode = unitDto.UnitCode,
                UnitName = unitDto.UnitName,
                DecimalAllowed = unitDto.DecimalAllowed,
                IsActive = unitDto.IsActive,
                IsDeleted = false
            };

            _context.Units.Add(unit);

            await _context.SaveChangesAsync();

            unitDto.UnitId = unit.UnitId;
            unitDto.IsDeleted = unit.IsDeleted;

            return unitDto;
        }

        public async Task<UnitDto?> UpdateAsync(int id, UnitDto unitDto)
        {
            var unit = await _context.Units
                .FirstOrDefaultAsync(u =>
                    u.UnitId == id && !u.IsDeleted);

            if (unit == null)
                return null;

            unit.UnitCode = unitDto.UnitCode;
            unit.UnitName = unitDto.UnitName;
            unit.DecimalAllowed = unitDto.DecimalAllowed;
            unit.IsActive = unitDto.IsActive;

            await _context.SaveChangesAsync();

            unitDto.UnitId = unit.UnitId;
            unitDto.IsDeleted = unit.IsDeleted;

            return unitDto;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var unit = await _context.Units
                .FirstOrDefaultAsync(u =>
                    u.UnitId == id && !u.IsDeleted);

            if (unit == null)
                return false;

            unit.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
