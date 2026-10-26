using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO;
using PayrollManagementAPI.DTO.ExpenseType;
using PayrollManagementAPI.DTO.SalaryComponent;
using CompanyPlatform.Core.Repository;

namespace PayrollManagementAPI.Services.SalaryComponent
{
    public class SalaryComponentService : ISalaryComponentService
    {
        private readonly ApplicationDBContext _context;

        public SalaryComponentService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SalaryComponentDto>> GetAllAsync()
        {
            return await _context.Tb_SalaryComponents
                .Where(c => c.IsDeleted == false)
                .Select(c => new SalaryComponentDto
                {
                    Id = c.Id,
                    ComponentName = c.ComponentName,
                    ComponentType = c.ComponentType,
                    IsTaxable = c.IsTaxable
                }).ToListAsync();
        }

        public async Task<IEnumerable<SalaryComponentDto>> GetComponent()
        {
            return await _context.Tb_SalaryComponents
                .Where(c => c.IsDeleted == false && c.ComponentName != "LWF")
                .Select(c => new SalaryComponentDto
                {
                    Id = c.Id,
                    ComponentName = c.ComponentName,
                    ComponentType = c.ComponentType,
                    IsTaxable = c.IsTaxable
                }).ToListAsync();
        }

        public async Task<SalaryComponentDto> GetByIdAsync(int id)
        {
            var component = await _context.Tb_SalaryComponents
                .Where(c => c.Id == id && c.IsDeleted == false)
                .Select(c => new SalaryComponentDto
                {
                    Id = c.Id,
                    ComponentName = c.ComponentName,
                    ComponentType = c.ComponentType,
                    IsTaxable = c.IsTaxable
                }).FirstOrDefaultAsync();

            return component;
        }

        public async Task<SalaryComponentDto> CreateAsync(SalaryComponentCreateDto dto)
        {
            var component = new CompanyPlatform.Core.Models.SalaryComponent
            {
                ComponentName = dto.ComponentName,
                ComponentType = dto.ComponentType,
                IsTaxable = dto.IsTaxable,
                IsDeleted = false
            };

            _context.Tb_SalaryComponents.Add(component);
            await _context.SaveChangesAsync();

            return new SalaryComponentDto
            {
                Id = component.Id,
                ComponentName = component.ComponentName,
                ComponentType = component.ComponentType,
                IsTaxable = component.IsTaxable
            };
        }

        public async Task<bool> UpdateAsync(int id, SalaryComponentCreateDto dto)
        {
            var component = await _context.Tb_SalaryComponents.FindAsync(id);
            if (component == null || component.IsDeleted) return false;

            component.ComponentName = dto.ComponentName;
            component.ComponentType = dto.ComponentType;
            component.IsTaxable = dto.IsTaxable;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var component = await _context.Tb_SalaryComponents.FindAsync(id);
            if (component == null) return false;

            component.IsDeleted = true; // Soft delete
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

