using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO;
using PayrollManagementAPI.DTO.ExpenseType;
using CompanyPlatform.Core.Repository;

namespace PayrollManagementAPI.Services.StatutorySetting
{
    public class StatutorySettingService:IStatutorySettingService
    {
        private readonly IRepositories<CompanyPlatform.Core.Models.StatutorySetting> _repositories;
        private readonly ApplicationDBContext _context;

        public StatutorySettingService(IRepositories<CompanyPlatform.Core.Models.StatutorySetting> repositories, ApplicationDBContext context)
        {
            _repositories = repositories;
            _context = context;
        }

        public async Task<IEnumerable<StatutorySettingDto>> GetAllStatutorySettingsAsync()
        {
            var query = from sa in _context.Tb_StatutorySettings

                        select new StatutorySettingDto
                        {
                            Id = sa.Id,
                            SettingName = sa.SettingName,
                            SettingValue = sa.SettingValue,
                            EffectiveDate = sa.EffectiveDate,
                            IsDeleted = sa.IsDeleted,

                        };
            return await query.Where(e => e.IsDeleted == false).ToListAsync();

        }


        public async Task<StatutorySettingDto> GetStatutorySettingByIdAsync(int id)
        {
            var query = from sa in _context.Tb_StatutorySettings
                        where sa.Id == id
                        select new StatutorySettingDto
                        {
                            Id = sa.Id,
                            SettingName = sa.SettingName,
                            SettingValue = sa.SettingValue,
                            EffectiveDate = sa.EffectiveDate,
                            IsDeleted = sa.IsDeleted,
                        };

            return await query.Where(e => e.IsDeleted == false).FirstOrDefaultAsync();

        }


        public async Task<StatutorySettingDto> CreateStatutorySettingAsync(StatutorySettingDto dto)
        {
            var entity = new CompanyPlatform.Core.Models.StatutorySetting
            {
                SettingName = dto.SettingName,
                SettingValue = dto.SettingValue,
                EffectiveDate = dto.EffectiveDate,
                IsDeleted = dto.IsDeleted,
            };

            await _repositories.Add(entity);

            dto.Id = entity.Id;
            return dto;
        }

        public async Task<bool> UpdateStatutorySettingAsync(int id, StatutorySettingDto dto)
        {
            var entity = await _repositories.GetByIdAsync(id);
            if (entity == null)
                return false;

            entity.SettingName = dto.SettingName;
            entity.SettingValue = dto.SettingValue;
            entity.EffectiveDate = dto.EffectiveDate;
            entity.IsDeleted = dto.IsDeleted;

            await _repositories.Update(entity);
            return true;
        }


        public async Task DeleteStatutorySettingAsync(int id)
        {
            var sa = await _context.Tb_StatutorySettings.FindAsync(id);
            if (sa != null)
            {
                sa.IsDeleted = true;
                _context.Tb_StatutorySettings.Update(sa);
                await _context.SaveChangesAsync();
                await _repositories.SoftDelete(sa);
            }
        }
    }
}
