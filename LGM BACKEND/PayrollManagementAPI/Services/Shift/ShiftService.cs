using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO;
using PayrollManagementAPI.DTO.ExpenseType;
using CompanyPlatform.Core.Repository;

namespace PayrollManagementAPI.Services.Shift
{
    public class ShiftService:IShiftService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.Shift> _repository;
        private readonly ApplicationDBContext _context;
        public ShiftService(IRepositories<CompanyPlatform.Core.Models.Shift> repository, ApplicationDBContext context)
        {
            _repository = repository;
            _context = context;
        }

        public async Task<IEnumerable<ShiftDto>> GetAllShiftsAsync()
        {
            var query = from sa in _context.Tb_Shifts

                        select new ShiftDto
                        {
                            Id = sa.Id,
                            ShiftName = sa.ShiftName,
                            StartTime = sa.StartTime,
                            EndTime = sa.EndTime,
                            IsDeleted = sa.IsDeleted,

                        };
            return await query.Where(e => e.IsDeleted == false).ToListAsync();

        }


        public async Task<ShiftDto> GetShiftByIdAsync(int id)
        {
            var query = from sa in _context.Tb_Shifts
                        where sa.Id == id
                        select new ShiftDto
                        {
                            Id = sa.Id,
                            ShiftName = sa.ShiftName,
                            StartTime = sa.StartTime,
                            EndTime = sa.EndTime,
                            IsDeleted = sa.IsDeleted,
                        };

            return await query.Where(e => e.IsDeleted == false).FirstOrDefaultAsync();

        }


        public async Task<ShiftDto> CreateShiftAsync(ShiftDto dto)
        {
            var entity = new CompanyPlatform.Core.Models.Shift
            {
               ShiftName = dto.ShiftName,
               StartTime = dto.StartTime,
               EndTime = dto.EndTime,
               IsDeleted = dto.IsDeleted,
            };

            await _repository.Add(entity);

            dto.Id = entity.Id;
            return dto;
        }

        public async Task<bool> UpdateShiftAsync(int id, ShiftDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return false;

            entity.ShiftName = dto.ShiftName;
            entity.StartTime = dto.StartTime;
            entity.EndTime = dto.EndTime;
            entity.IsDeleted = dto.IsDeleted;

            await _repository.Update(entity);
            return true;
        }


        public async Task DeleteShiftAsync(int id)
        {
            var sa = await _context.Tb_Shifts.FindAsync(id);
            if (sa != null)
            {
                sa.IsDeleted = true;
                _context.Tb_Shifts.Update(sa);
                await _context.SaveChangesAsync();
                await _repository.SoftDelete(sa);
            }
        }
    }
}
