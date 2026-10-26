using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.PartCondition;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.PartCondition
{
    public class PartConditionService : IPartConditionService
    {
        private readonly ApplicationDBContext _context;
        public PartConditionService(ApplicationDBContext context) => _context = context;

        public async Task<List<PartConditionDto>> GetAllAsync()
        {
            return await _context.Tbl_PartConditions
                .Where(x => !x.IsDeleted)
                .Select(x => new PartConditionDto { Id = x.Id, PartConditionName = x.PartConditionName })
                .ToListAsync();
        }

        public async Task<PartConditionDto> CreateAsync(PartConditionDto dto)
        {
            var condition = new Models.Commonmaster.PartCondition { PartConditionName = dto.PartConditionName };
            _context.Tbl_PartConditions.Add(condition);
            await _context.SaveChangesAsync();
            dto.Id = condition.Id;
            return dto;
        }

        public async Task<bool> UpdateAsync(PartConditionDto dto)
        {
            var condition = await _context.Tbl_PartConditions.FindAsync(dto.Id);
            if (condition == null) return false;
            condition.PartConditionName = dto.PartConditionName;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var condition = await _context.Tbl_PartConditions.FindAsync(id);
            if (condition == null) return false;
            condition.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
