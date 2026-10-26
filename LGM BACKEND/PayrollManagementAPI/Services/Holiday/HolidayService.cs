using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.SalaryComponent;
using PayrollManagementAPI.DTO;
using Microsoft.EntityFrameworkCore;

namespace PayrollManagementAPI.Services.Holiday
{
    public class HolidayService : IHolidayService
    {
        private readonly ApplicationDBContext _context;

        public HolidayService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HolidayDto>> GetAllAsync()
        {
            return await _context.Tbl_Holidays
                .Where(c => c.IsDeleted == false)
                .Select(c => new HolidayDto
                {
                    Id = c.Id,
                    Date = c.Date,
                    Description = c.Description,
                    Year = c.Year,
                    IsDeleted = c.IsDeleted,
                }).ToListAsync();
        }


        public async Task<HolidayDto> GetByIdAsync(int id)
        {
            var holiday = await _context.Tbl_Holidays
                .Where(c => c.Id == id && c.IsDeleted == false)
                .Select(c => new HolidayDto
                {
                    Id = c.Id,
                    Date = c.Date,
                    Description = c.Description,
                    Year = c.Year,
                    IsDeleted = c.IsDeleted,
                }).FirstOrDefaultAsync();

            return holiday;
        }

        public async Task<HolidayDto> CreateAsync(HolidayDto dto)
        {
            var holiday = new CompanyPlatform.Core.Models.Holiday
            {
                Date = dto.Date,
                Description = dto.Description,
                Year = dto.Year,
                IsDeleted = false
            };

            _context.Tbl_Holidays.Add(holiday);
            await _context.SaveChangesAsync();

            return new HolidayDto
            {
              Id= dto.Id,
              Date = dto.Date,
              Description = dto.Description,
              Year = dto.Year,
            };
        }

        public async Task<bool> UpdateAsync(int id, HolidayDto dto)
        {
            var holiday = await _context.Tbl_Holidays.FindAsync(id);
            if (holiday == null || holiday.IsDeleted) return false;

            holiday.Date = dto.Date;
            holiday.Description = dto.Description;
            holiday.Year = dto.Year;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var holiday = await _context.Tbl_Holidays.FindAsync(id);
            if (holiday == null) return false;

            holiday.IsDeleted = true; // Soft delete
            await _context.SaveChangesAsync();
            return true;
        }

    }
}
