using Microsoft.AspNetCore.Components;
using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO;
using PayrollManagementAPI.DTO.SalaryComponent;
using CompanyPlatform.Core.Models;

namespace PayrollManagementAPI.Services.SalarySetting
{
    public class SalarySettingService : ISalarySettingService
    {
        private readonly ApplicationDBContext _context;

        public SalarySettingService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SalarySettingPercentageDto>> GetAllSettingsAsync()
        {
            return await _context.Tbl_SalarySettingPercentages
                .Where(c => !c.IsDeleted)
                .Select(c => new SalarySettingPercentageDto
                {
                    Id = c.Id,
                    ComponentName = c.ComponentName,
                    Percentage = c.Percentage,
                    FixedAmount = c.FixedAmount,
                    CalculationBase = c.CalculationBase,
                    IsApplicable = c.IsApplicable,
                    EffectiveFrom = c.EffectiveFrom,
                    EffectiveTo = c.EffectiveTo,
                    IsDeleted = c.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<SalarySettingPercentageDto?> GetSettingByIdAsync(int id)
        {
            return await _context.Tbl_SalarySettingPercentages
                .Where(c => c.Id == id && !c.IsDeleted)
                .Select(c => new SalarySettingPercentageDto
                {
                    Id = c.Id,
                    ComponentName = c.ComponentName,
                    Percentage = c.Percentage,
                    FixedAmount = c.FixedAmount,
                    CalculationBase = c.CalculationBase,
                    IsApplicable = c.IsApplicable,
                    EffectiveFrom = c.EffectiveFrom,
                    EffectiveTo = c.EffectiveTo,
                    IsDeleted = c.IsDeleted
                })
                .FirstOrDefaultAsync();
        }

        public async Task<SalarySettingPercentageDto> CreateSettingAsync(SalarySettingPercentageCreateUpdateDto dto)
        {
            var entity = new SalarySettingPercentage
            {
                ComponentName = dto.ComponentName,
                Percentage = dto.Percentage,
                FixedAmount = dto.FixedAmount,
                CalculationBase = dto.CalculationBase,
                IsApplicable = dto.IsApplicable,
                EffectiveFrom = dto.EffectiveFrom,
                EffectiveTo = dto.EffectiveTo,
                IsDeleted = false
            };

            _context.Tbl_SalarySettingPercentages.Add(entity);
            await _context.SaveChangesAsync();

            return await GetSettingByIdAsync(entity.Id);
        }

        public async Task<bool> UpdateSettingAsync(int id, SalarySettingPercentageCreateUpdateDto dto)
        {
            var entity = await _context.Tbl_SalarySettingPercentages.FindAsync(id);
            if (entity == null || entity.IsDeleted) return false;

            entity.ComponentName = dto.ComponentName;
            entity.Percentage = dto.Percentage;
            entity.FixedAmount = dto.FixedAmount;
            entity.CalculationBase = dto.CalculationBase;
            entity.IsApplicable = dto.IsApplicable;
            entity.EffectiveFrom = dto.EffectiveFrom;
            entity.EffectiveTo = dto.EffectiveTo;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteSettingAsync(int id)
        {
            var entity = await _context.Tbl_SalarySettingPercentages.FindAsync(id);
            if (entity == null) return false;

            entity.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<SalaryComponentDtos>> GetEarningComponentsAsync()
        {
            return await _context.Tb_SalaryComponents
                .Where(c =>
                    !c.IsDeleted &&
                    c.ComponentType == "Earning") 
                .Select(c => new SalaryComponentDtos
                {
                    Id = c.Id,
                    ComponentName = c.ComponentName,
                    ComponentType = c.ComponentType,
                    IsTaxable = c.IsTaxable
                })
                .ToListAsync();
        }
    }
}
