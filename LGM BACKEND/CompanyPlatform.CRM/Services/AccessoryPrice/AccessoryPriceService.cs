
using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTOs;
using Microsoft.EntityFrameworkCore;

using AccessoryPriceModel =
    CompanyPlatform.Core.Models.CRM.AccessoryPrice;

using PriceListModel =
    CompanyPlatform.Core.Models.CRM.PriceList;

using AccessoriesModel =
    CompanyPlatform.Core.Models.CRM.Accessories;

namespace CompanyPlatform.CRM.Services.AccessoryPrice
{
    public class AccessoryPriceService : IAccessoryPriceService
    {
        private readonly ApplicationDBContext _context;

        public AccessoryPriceService(ApplicationDBContext context)
        {
            _context = context;
        }

        // Map entity to DTO
        private static AccessoryPriceDto Map(AccessoryPriceModel x)
        {
            return new AccessoryPriceDto
            {
                AccessoryPriceId = x.AccessoryPriceId,
                PriceListId = x.PriceListId,
                AccessoriesId = x.AccessoriesId,
                PriceType = x.PriceType,
                Amount = x.Amount,
                MinQty = x.MinQty,
                EffectiveFrom = x.EffectiveFrom,
                EffectiveTo = x.EffectiveTo,
                IsActive = x.IsActive,
                IsDeleted = x.IsDeleted
            };
        }

        // GET: api/AccessoryPrice
        public async Task<IEnumerable<AccessoryPriceDto>> GetAllAsync()
        {
            var items = await _context
                .Set<AccessoryPriceModel>()
                .AsNoTracking()
                .Where(x => !x.IsDeleted)
                .ToListAsync();

            return items.Select(Map);
        }

        // GET: api/AccessoryPrice/{id}
        public async Task<AccessoryPriceDto?> GetByIdAsync(int id)
        {
            var item = await _context
                .Set<AccessoryPriceModel>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.AccessoryPriceId == id &&
                    !x.IsDeleted);

            return item == null ? null : Map(item);
        }

        // POST: api/AccessoryPrice
        public async Task<AccessoryPriceDto> CreateAsync(
            AccessoryPriceDto dto)
        {
            await ValidateAsync(dto);

            var item = new AccessoryPriceModel
            {
                PriceListId = dto.PriceListId,
                AccessoriesId = dto.AccessoriesId,
                PriceType = dto.PriceType,
                Amount = dto.Amount,
                MinQty = dto.MinQty,
                EffectiveFrom = dto.EffectiveFrom,
                EffectiveTo = dto.EffectiveTo,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            _context.Set<AccessoryPriceModel>().Add(item);

            await _context.SaveChangesAsync();

            return Map(item);
        }

        // PUT: api/AccessoryPrice/{id}
        public async Task<bool> UpdateAsync(
            int id,
            AccessoryPriceDto dto)
        {
            var item = await _context
                .Set<AccessoryPriceModel>()
                .FirstOrDefaultAsync(x =>
                    x.AccessoryPriceId == id &&
                    !x.IsDeleted);

            if (item == null)
                return false;

            await ValidateAsync(dto);

            item.PriceListId = dto.PriceListId;
            item.AccessoriesId = dto.AccessoriesId;
            item.PriceType = dto.PriceType;
            item.Amount = dto.Amount;
            item.MinQty = dto.MinQty;
            item.EffectiveFrom = dto.EffectiveFrom;
            item.EffectiveTo = dto.EffectiveTo;
            item.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return true;
        }

        // DELETE: api/AccessoryPrice/{id}
        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _context
                .Set<AccessoryPriceModel>()
                .FirstOrDefaultAsync(x =>
                    x.AccessoryPriceId == id &&
                    !x.IsDeleted);

            if (item == null)
                return false;

            // Soft delete
            item.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }

        // Validate fields and foreign keys
        private async Task ValidateAsync(AccessoryPriceDto dto)
        {
            if (dto.PriceListId <= 0)
                throw new ArgumentException(
                    "PriceListId must be greater than zero.");

            if (dto.AccessoriesId <= 0)
                throw new ArgumentException(
                    "AccessoriesId must be greater than zero.");

            if (string.IsNullOrWhiteSpace(dto.PriceType))
                throw new ArgumentException("PriceType is required.");

            if (dto.Amount <= 0)
                throw new ArgumentException(
                    "Amount must be greater than zero.");

            if (dto.MinQty < 1)
                throw new ArgumentException(
                    "MinQty must be at least 1.");

            if (dto.EffectiveTo.HasValue &&
                dto.EffectiveTo.Value < dto.EffectiveFrom)
            {
                throw new ArgumentException(
                    "EffectiveTo cannot be earlier than EffectiveFrom.");
            }

            // Validate PriceList foreign key
            var priceListExists = await _context
                .Set<PriceListModel>()
                .AnyAsync(x =>
                    x.PriceListId == dto.PriceListId &&
                    !x.IsDeleted);

            if (!priceListExists)
                throw new ArgumentException("PriceListId is invalid.");

            // Validate Accessories foreign key
            var accessoriesExists = await _context
                .Set<AccessoriesModel>()
                .AnyAsync(x =>
                    x.AccessoriesId == dto.AccessoriesId &&
                    !x.IsDeleted);

            if (!accessoriesExists)
                throw new ArgumentException("AccessoriesId is invalid.");
        }
    }
}
