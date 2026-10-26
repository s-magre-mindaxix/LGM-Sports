using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO.Reason;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Reason
{
    public class ReasonService : IReasonService
    {
        private readonly ApplicationDBContext _context;

        public ReasonService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReasonDto>> GetAllAsync()
        {
            return await _context.Tbl_Reasons
                .Select(r => new ReasonDto
                {
                    ReasonId = r.ReasonId,
                    Code = r.Code,
                    Name = r.Name,
                    ReasonType = r.ReasonType,
                    IsActive = r.IsActive
                })
                .ToListAsync();
        }

        public async Task<ReasonDto?> GetByIdAsync(int id)
        {
            var reason = await _context.Tbl_Reasons.FindAsync(id);

            if (reason == null)
                return null;

            return new ReasonDto
            {
                ReasonId = reason.ReasonId,
                Code = reason.Code,
                Name = reason.Name,
                ReasonType = reason.ReasonType,
                IsActive = reason.IsActive
            };
        }

        public async Task<ReasonDto> CreateAsync(ReasonDto dto)
        {
            var duplicateCode = await _context.Tbl_Reasons
                .AnyAsync(r => r.Code == dto.Code);

            if (duplicateCode)
                throw new System.InvalidOperationException(
                    "A reason with this code already exists.");

            var reason = new CompanyPlatform.Core.Models.CRM.Reason
            {
                Code = dto.Code,
                Name = dto.Name,
                ReasonType = dto.ReasonType,
                IsActive = dto.IsActive
            };

            _context.Tbl_Reasons.Add(reason);
            await _context.SaveChangesAsync();

            dto.ReasonId = reason.ReasonId;
            return dto;
        }

        public async Task<bool> UpdateAsync(int id, ReasonDto dto)
        {
            var reason = await _context.Tbl_Reasons.FindAsync(id);

            if (reason == null)
                return false;

            var duplicateCode = await _context.Tbl_Reasons
                .AnyAsync(r => r.Code == dto.Code && r.ReasonId != id);

            if (duplicateCode)
                throw new System.InvalidOperationException(
                    "Another reason with this code already exists.");

            reason.Code = dto.Code;
            reason.Name = dto.Name;
            reason.ReasonType = dto.ReasonType;
            reason.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var reason = await _context.Tbl_Reasons.FindAsync(id);

            if (reason == null)
                return false;

            _context.Tbl_Reasons.Remove(reason);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}