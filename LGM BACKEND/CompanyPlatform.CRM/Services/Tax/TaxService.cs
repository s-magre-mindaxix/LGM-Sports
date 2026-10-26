
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTOs.Inventory;
using CompanyPlatform.Core.Interfaces.Inventory;
using CompanyPlatform.Core.Models.Inventory;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Services.Inventory
{
    public class TaxService : ITaxService
    {
        private readonly ApplicationDBContext _context;

        public TaxService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TaxDto>> GetAllAsync()
        {
            return await _context.Taxes
                .AsNoTracking()
                .Where(t => !t.IsDeleted)
                .Select(t => new TaxDto
                {
                    TaxId = t.TaxId,
                    TaxCode = t.TaxCode,
                    TaxName = t.TaxName,
                    Rate = t.Rate,
                    TaxType = t.TaxType,
                    EffectiveFrom = t.EffectiveFrom,
                    EffectiveTo = t.EffectiveTo,
                    IsActive = t.IsActive,
                    IsDeleted = t.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<TaxDto?> GetByIdAsync(int id)
        {
            return await _context.Taxes
                .AsNoTracking()
                .Where(t => t.TaxId == id && !t.IsDeleted)
                .Select(t => new TaxDto
                {
                    TaxId = t.TaxId,
                    TaxCode = t.TaxCode,
                    TaxName = t.TaxName,
                    Rate = t.Rate,
                    TaxType = t.TaxType,
                    EffectiveFrom = t.EffectiveFrom,
                    EffectiveTo = t.EffectiveTo,
                    IsActive = t.IsActive,
                    IsDeleted = t.IsDeleted
                })
                .FirstOrDefaultAsync();
        }

        public async Task<TaxDto> CreateAsync(TaxDto taxDto)
        {
            var tax = new Tax
            {
                TaxCode = taxDto.TaxCode,
                TaxName = taxDto.TaxName,
                Rate = taxDto.Rate,
                TaxType = taxDto.TaxType,
                EffectiveFrom = taxDto.EffectiveFrom,
                EffectiveTo = taxDto.EffectiveTo,
                IsActive = taxDto.IsActive,
                IsDeleted = false
            };

            _context.Taxes.Add(tax);

            await _context.SaveChangesAsync();

            taxDto.TaxId = tax.TaxId;
            taxDto.IsDeleted = tax.IsDeleted;

            return taxDto;
        }

        public async Task<TaxDto?> UpdateAsync(int id, TaxDto taxDto)
        {
            var tax = await _context.Taxes
                .FirstOrDefaultAsync(t =>
                    t.TaxId == id && !t.IsDeleted);

            if (tax == null)
                return null;

            tax.TaxCode = taxDto.TaxCode;
            tax.TaxName = taxDto.TaxName;
            tax.Rate = taxDto.Rate;
            tax.TaxType = taxDto.TaxType;
            tax.EffectiveFrom = taxDto.EffectiveFrom;
            tax.EffectiveTo = taxDto.EffectiveTo;
            tax.IsActive = taxDto.IsActive;

            await _context.SaveChangesAsync();

            taxDto.TaxId = tax.TaxId;
            taxDto.IsDeleted = tax.IsDeleted;

            return taxDto;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var tax = await _context.Taxes
                .FirstOrDefaultAsync(t =>
                    t.TaxId == id && !t.IsDeleted);

            if (tax == null)
                return false;

            tax.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
