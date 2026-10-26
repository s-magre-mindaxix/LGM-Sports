using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Services.Country;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Services
{
    public class CountryService : ICountryService
    {
        private readonly ApplicationDBContext _context;

        public CountryService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CountryDto>> GetAllAsync()
        {
            return await _context.Tbl_Countries
                .Where(c => !c.IsDeleted)
                .Select(c => new CountryDto
                {
                    Id = c.Id,
                    CountryName = c.CountryName,
                    CountryCode = c.CountryCode
                }).ToListAsync();
        }

        public async Task<CountryDto> GetByIdAsync(int id)
        {
            var c = await _context.Tbl_Countries.FindAsync(id);
            if (c == null || c.IsDeleted) return null;

            return new CountryDto
            {
                Id = c.Id,
                CountryName = c.CountryName,
                CountryCode = c.CountryCode
            };
        }

        public async Task<CountryDto> CreateAsync(CountryDto dto)
        {
            var entity = new Models.Country
            {
                CountryName = dto.CountryName,
                CountryCode = dto.CountryCode
            };

            _context.Tbl_Countries.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.Id;
            return dto;
        }

        public async Task<bool> UpdateAsync(int id, CountryDto dto)
        {
            var c = await _context.Tbl_Countries.FindAsync(id);
            if (c == null || c.IsDeleted) return false;

            c.CountryName = dto.CountryName;
            c.CountryCode = dto.CountryCode;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var c = await _context.Tbl_Countries.FindAsync(id);
            if (c == null) return false;

            c.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
