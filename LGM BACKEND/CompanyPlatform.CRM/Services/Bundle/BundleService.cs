
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO.Bundle;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.CRM.Services.Bundle
{
    public class BundleService : IBundleService
    {
        private readonly ApplicationDBContext _context;

        public BundleService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BundleDto>> GetAllAsync()
        {
            return await _context.Tbl_Bundles
                .AsNoTracking()
                .Select(x => new BundleDto
                {
                    BundleId = x.BundleId,
                    Code = x.Code,
                    Name = x.Name,
                    ParentProductId = x.ParentProductId,
                    PackagePrice = x.PackagePrice,
                    TaxMode = x.TaxMode,
                    EffectiveFrom = x.EffectiveFrom,
                    EffectiveTo = x.EffectiveTo,
                    IsActive = x.IsActive
                })
                .ToListAsync();
        }

        public async Task<BundleDto?> GetByIdAsync(int id)
        {
            var x = await _context.Tbl_Bundles
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.BundleId == id);

            if (x == null)
                return null;

            return new BundleDto
            {
                BundleId = x.BundleId,
                Code = x.Code,
                Name = x.Name,
                ParentProductId = x.ParentProductId,
                PackagePrice = x.PackagePrice,
                TaxMode = x.TaxMode,
                EffectiveFrom = x.EffectiveFrom,
                EffectiveTo = x.EffectiveTo,
                IsActive = x.IsActive
            };
        }

        public async Task<BundleDto> CreateAsync(BundleDto dto)
        {
            ValidateDates(dto);

            bool codeExists = await _context.Tbl_Bundles
                .AnyAsync(x => x.Code == dto.Code);

            if (codeExists)
                throw new ArgumentException(
                    "Bundle code already exists.");

            var item = new CompanyPlatform.Core.Models.CRM.Bundle
            {
                Code = dto.Code.Trim(),
                Name = dto.Name.Trim(),
                ParentProductId = dto.ParentProductId,
                PackagePrice = dto.PackagePrice,
                TaxMode = dto.TaxMode.Trim(),
                EffectiveFrom = dto.EffectiveFrom,
                EffectiveTo = dto.EffectiveTo,
                IsActive = dto.IsActive
            };

            _context.Tbl_Bundles.Add(item);
            await _context.SaveChangesAsync();

            dto.BundleId = item.BundleId;
            return dto;
        }

        public async Task<bool> UpdateAsync(int id, BundleDto dto)
        {
            var item = await _context.Tbl_Bundles
                .FirstOrDefaultAsync(x => x.BundleId == id);

            if (item == null)
                return false;

            ValidateDates(dto);

            bool codeExists = await _context.Tbl_Bundles
                .AnyAsync(x => x.Code == dto.Code &&
                               x.BundleId != id);

            if (codeExists)
                throw new ArgumentException(
                    "Bundle code already exists.");

            item.Code = dto.Code.Trim();
            item.Name = dto.Name.Trim();
            item.ParentProductId = dto.ParentProductId;
            item.PackagePrice = dto.PackagePrice;
            item.TaxMode = dto.TaxMode.Trim();
            item.EffectiveFrom = dto.EffectiveFrom;
            item.EffectiveTo = dto.EffectiveTo;
            item.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _context.Tbl_Bundles
                .FirstOrDefaultAsync(x => x.BundleId == id);

            if (item == null)
                return false;

            _context.Tbl_Bundles.Remove(item);
            await _context.SaveChangesAsync();

            return true;
        }

        private static void ValidateDates(BundleDto dto)
        {
            if (dto.EffectiveTo.HasValue &&
                dto.EffectiveTo.Value.Date < dto.EffectiveFrom.Date)
            {
                throw new ArgumentException(
                    "Effective To cannot be earlier than Effective From.");
            }

            if (dto.PackagePrice < 0)
                throw new ArgumentException(
                    "Package price cannot be negative.");
        }
    }
}
