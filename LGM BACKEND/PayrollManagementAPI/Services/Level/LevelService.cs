using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.HRMS;
using Microsoft.EntityFrameworkCore;
using PayrollManagementAPI.DTO.Level;

namespace PayrollManagementAPI.Services.Level
{
    public class LevelService : ILevelService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<LevelService> _logger;

        public LevelService(ApplicationDBContext context, ILogger<LevelService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<LevelDto>> GetAllLevelsAsync()
        {
            return await _context.Tbl_LevelMasters
                .Where(l => !l.IsDeleted)
                .OrderBy(l => l.LevelOrder)
                .Select(l => new LevelDto
                {
                    ID = l.ID,
                    LevelName = l.LevelName,
                    LevelOrder = l.LevelOrder,
                    IsActive = l.IsActive
                })
                .ToListAsync();
        }

        public async Task<LevelDto> GetLevelByIdAsync(int id)
        {
            var level = await _context.Tbl_LevelMasters
                .FirstOrDefaultAsync(l => l.ID == id && !l.IsDeleted);

            if (level == null)
                return null;

            return new LevelDto
            {
                ID = level.ID,
                LevelName = level.LevelName,
                LevelOrder = level.LevelOrder,
                IsActive = level.IsActive
            };
        }

        public async Task<LevelDto> CreateLevelAsync(CreateLevelDto dto)
        {
            var level = new LevelMaster
            {
                LevelName = dto.LevelName,
                LevelOrder = dto.LevelOrder,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            _context.Tbl_LevelMasters.Add(level);
            await _context.SaveChangesAsync();

            return new LevelDto
            {
                ID = level.ID,
                LevelName = level.LevelName,
                LevelOrder = level.LevelOrder,
                IsActive = level.IsActive
            };
        }

        public async Task<LevelDto> UpdateLevelAsync(int id, UpdateLevelDto dto)
        {
            var level = await _context.Tbl_LevelMasters
                .FirstOrDefaultAsync(l => l.ID == id && !l.IsDeleted);

            if (level == null)
                return null;

            level.LevelName = dto.LevelName;
            level.LevelOrder = dto.LevelOrder;
            level.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return new LevelDto
            {
                ID = level.ID,
                LevelName = level.LevelName,
                LevelOrder = level.LevelOrder,
                IsActive = level.IsActive
            };
        }

        public async Task<bool> DeleteLevelAsync(int id)
        {
            var level = await _context.Tbl_LevelMasters
                .FirstOrDefaultAsync(l => l.ID == id);

            if (level == null)
                return false;

            level.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
