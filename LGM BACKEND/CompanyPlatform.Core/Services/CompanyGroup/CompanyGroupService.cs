using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.CompanyGroupDto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.CompanyGroup
{
    public class CompanyGroupService : ICompanyGroupService
    {
        private readonly ApplicationDBContext _context;

        public CompanyGroupService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<CompanyGroupDto>> GetAllAsync()
        {
            return await _context.Tbl_CompanyGroups
                .Where(cg => !cg.IsDeleted)
                .Select(cg => new CompanyGroupDto
                {
                    Id = cg.Id,
                    CompanyGroupName = cg.CompanyGroupName
                })
                .ToListAsync();
        }

        public async Task<CompanyGroupDto> GetByIdAsync(int id)
        {
            return await _context.Tbl_CompanyGroups
                .Where(cg => cg.Id == id && !cg.IsDeleted)
                .Select(cg => new CompanyGroupDto
                {
                    Id = cg.Id,
                    CompanyGroupName = cg.CompanyGroupName
                })
                .FirstOrDefaultAsync();
        }

        public async Task<CompanyGroupDto> CreateAsync(CompanyGroupDto dto)
        {
            var companyGroup = new Models.CRM.CompanyGroup
            {
                CompanyGroupName = dto.CompanyGroupName,
                IsDeleted = false
            };

            _context.Tbl_CompanyGroups.Add(companyGroup);
            await _context.SaveChangesAsync();

            dto.Id = companyGroup.Id;
            return dto;
        }

        public async Task<bool> UpdateAsync(CompanyGroupDto dto)
        {
            var existingGroup = await _context.Tbl_CompanyGroups
                .FirstOrDefaultAsync(cg => cg.Id == dto.Id && !cg.IsDeleted);

            if (existingGroup == null) return false;

            existingGroup.CompanyGroupName = dto.CompanyGroupName;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var group = await _context.Tbl_CompanyGroups.FindAsync(id);

            if (group == null) return false;

            // Soft Delete
            group.IsDeleted = true;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
