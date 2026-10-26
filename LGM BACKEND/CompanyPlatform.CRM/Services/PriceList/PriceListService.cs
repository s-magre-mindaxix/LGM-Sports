
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.Dashboards;
using CompanyPlatform.CRM.DTO.PriceList;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.CRM.Services.PriceList
{
    public class PriceListService : IPriceListService
    {
        private readonly ApplicationDBContext _context;

        public PriceListService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PriceListDto>> GetAllAsync()
        {
            return await _context.Tbl_PriceLists
                .AsNoTracking()
                .Select(x => new PriceListDto
                {
                    PriceListId = x.PriceListId,
                    Code = x.Code,
                    Name = x.Name,
                    CustomerChannelType = x.CustomerChannelType,
                    Id = x.Id,
                    EffectiveFrom = x.EffectiveFrom,
                    EffectiveTo = x.EffectiveTo,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<PriceListDto?> GetByIdAsync(int id)
        {
            var x = await _context.Tbl_PriceLists
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PriceListId == id);

            if (x == null)
                return null;

            return new PriceListDto
            {
                PriceListId = x.PriceListId,
                Code = x.Code,
                Name = x.Name,
                CustomerChannelType = x.CustomerChannelType,
                Id = x.Id,
                EffectiveFrom = x.EffectiveFrom,
                EffectiveTo = x.EffectiveTo,
                IsActive = x.IsActive,
                IsDeleted = x.IsDeleted
            };
        }

        public async Task<PriceListDto> CreateAsync(PriceListDto dto)
        {
            ValidateEffectiveDates(dto);

            bool currencyExists = await _context.Set<Currency>()
                .AnyAsync(c => c.Id == dto.Id);

            if (!currencyExists)
                throw new ArgumentException("Invalid CurrencyId. Currency does not exist.");

            bool codeExists = await _context.Tbl_PriceLists
                .AnyAsync(x => x.Code == dto.Code);

            if (codeExists)
                throw new ArgumentException("Price List code already exists.");

            var item = new CompanyPlatform.Core.Models.CRM.PriceList
            {
                Code = dto.Code.Trim(),
                Name = dto.Name.Trim(),
                CustomerChannelType = dto.CustomerChannelType.Trim(),
                Id = dto.Id,
                EffectiveFrom = dto.EffectiveFrom,
                EffectiveTo = dto.EffectiveTo,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            _context.Tbl_PriceLists.Add(item);
            await _context.SaveChangesAsync();

            dto.PriceListId = item.PriceListId;
            dto.Code = item.Code;
            dto.Name = item.Name;
            dto.CustomerChannelType = item.CustomerChannelType;
            dto.Id = item.Id;

            return dto;
        }

        public async Task<bool> UpdateAsync(int id, PriceListDto dto)
        {
            var item = await _context.Tbl_PriceLists
                .FirstOrDefaultAsync(x => x.PriceListId == id);

            if (item == null)
                return false;

            ValidateEffectiveDates(dto);

            bool currencyExists = await _context.Set<Currency>()
                .AnyAsync(c => c.Id == dto.Id);

            if (!currencyExists)
                throw new ArgumentException("Invalid CurrencyId. Currency does not exist.");

            bool codeExists = await _context.Tbl_PriceLists
                .AnyAsync(x => x.Code == dto.Code && x.PriceListId != id);

            if (codeExists)
                throw new ArgumentException("Price List code already exists.");

            item.Code = dto.Code.Trim();
            item.Name = dto.Name.Trim();
            item.CustomerChannelType = dto.CustomerChannelType.Trim();
            item.Id = dto.Id;
            item.EffectiveFrom = dto.EffectiveFrom;
            item.EffectiveTo = dto.EffectiveTo;
            item.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _context.Tbl_PriceLists
                .FirstOrDefaultAsync(x => x.PriceListId == id);

            if (item == null)
                return false;

            _context.Tbl_PriceLists.Remove(item);
            await _context.SaveChangesAsync();

            return true;
        }

        private static void ValidateEffectiveDates(PriceListDto dto)
        {
            if (dto.EffectiveTo.HasValue &&
                dto.EffectiveTo.Value.Date < dto.EffectiveFrom.Date)
            {
                throw new ArgumentException(
                    "Effective To cannot be earlier than Effective From.");
            }
        }
    }
}
