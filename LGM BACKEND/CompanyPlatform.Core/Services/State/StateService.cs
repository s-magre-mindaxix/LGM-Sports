using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Services.State;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Services.State
{
    public class StateService : IStateService
    {
        private readonly ApplicationDBContext _context;

        public StateService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<StateDto>> GetAllAsync()
        {
            return await _context.Tbl_States
                .Include(s => s.Country)
                .Where(s => !s.IsDeleted)
                .Select(s => new StateDto
                {
                    Id = s.Id,
                    StateName = s.StateName,
                    CountryId = s.CountryId,
                    CountryName = s.Country.CountryName
                }).ToListAsync();
        }

        public async Task<StateDto> GetByIdAsync(int id)
        {
            var s = await _context.Tbl_States.Include(x => x.Country)
                                         .FirstOrDefaultAsync(x => x.Id == id);

            if (s == null || s.IsDeleted) return null;

            return new StateDto
            {
                Id = s.Id,
                StateName = s.StateName,
                CountryId = s.CountryId,
                CountryName = s.Country.CountryName
            };
        }

        public async Task<StateDto> CreateAsync(StateDto dto)
        {
            var entity = new Models.State
            {
                StateName = dto.StateName,
                CountryId = dto.CountryId
            };

            _context.Tbl_States.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.Id;
            return dto;
        }

        public async Task<bool> UpdateAsync(int id, StateDto dto)
        {
            var s = await _context.Tbl_States.FindAsync(id);
            if (s == null || s.IsDeleted) return false;

            s.StateName = dto.StateName;
            s.CountryId = dto.CountryId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var s = await _context.Tbl_States.FindAsync(id);
            if (s == null) return false;

            s.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
