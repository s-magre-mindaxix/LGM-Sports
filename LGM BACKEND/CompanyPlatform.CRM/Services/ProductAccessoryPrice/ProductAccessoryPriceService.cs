
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO.ProductAccessoryPrice;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.CRM.Services.ProductAccessoryPrice
{
    public class ProductAccessoryPriceService
        : IProductAccessoryPriceService
    {
        private readonly ApplicationDBContext _context;

        public ProductAccessoryPriceService(
            ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductAccessoryPriceDto>>
            GetAllAsync()
        {
            return await _context.Tbl_ProductAccessoryPrices
                .AsNoTracking()
                .Select(x => new ProductAccessoryPriceDto
                {
                    Id = x.Id,
                    PriceListId = x.PriceListId,
                    ItemId = x.ItemId,
                    ItemType = x.ItemType,
                    PriceType = x.PriceType,
                    Amount = x.Amount,
                    MinQty = x.MinQty,
                    EffectiveFrom = x.EffectiveFrom,
                    EffectiveTo = x.EffectiveTo
                })
                .ToListAsync();
        }

        public async Task<ProductAccessoryPriceDto?> GetByIdAsync(
            int id)
        {
            var x = await _context.Tbl_ProductAccessoryPrices
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);

            if (x == null)
                return null;

            return new ProductAccessoryPriceDto
            {
                Id = x.Id,
                PriceListId = x.PriceListId,
                ItemId = x.ItemId,
                ItemType = x.ItemType,
                PriceType = x.PriceType,
                Amount = x.Amount,
                MinQty = x.MinQty,
                EffectiveFrom = x.EffectiveFrom,
                EffectiveTo = x.EffectiveTo
            };
        }

        public async Task<ProductAccessoryPriceDto> CreateAsync(
            ProductAccessoryPriceDto dto)
        {
            ValidateDates(dto);

            bool priceListExists = await _context.Tbl_PriceLists
                .AnyAsync(x => x.PriceListId == dto.PriceListId);

            if (!priceListExists)
                throw new ArgumentException(
                    "The selected Price List does not exist.");

            var item = new CompanyPlatform.Core.Models.CRM
                .ProductAccessoryPrice
            {
                PriceListId = dto.PriceListId,
                ItemId = dto.ItemId,
                ItemType = dto.ItemType.Trim(),
                PriceType = dto.PriceType.Trim(),
                Amount = dto.Amount,
                MinQty = dto.MinQty,
                EffectiveFrom = dto.EffectiveFrom,
                EffectiveTo = dto.EffectiveTo
            };

            _context.Tbl_ProductAccessoryPrices.Add(item);
            await _context.SaveChangesAsync();

            dto.Id = item.Id;
            return dto;
        }

        public async Task<bool> UpdateAsync(
            int id, ProductAccessoryPriceDto dto)
        {
            var item = await _context.Tbl_ProductAccessoryPrices
                .FirstOrDefaultAsync(x => x.Id == id);

            if (item == null)
                return false;

            ValidateDates(dto);

            bool priceListExists = await _context.Tbl_PriceLists
                .AnyAsync(x => x.PriceListId == dto.PriceListId);

            if (!priceListExists)
                throw new ArgumentException(
                    "The selected Price List does not exist.");

            item.PriceListId = dto.PriceListId;
            item.ItemId = dto.ItemId;
            item.ItemType = dto.ItemType.Trim();
            item.PriceType = dto.PriceType.Trim();
            item.Amount = dto.Amount;
            item.MinQty = dto.MinQty;
            item.EffectiveFrom = dto.EffectiveFrom;
            item.EffectiveTo = dto.EffectiveTo;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _context.Tbl_ProductAccessoryPrices
                .FirstOrDefaultAsync(x => x.Id == id);

            if (item == null)
                return false;

            _context.Tbl_ProductAccessoryPrices.Remove(item);
            await _context.SaveChangesAsync();

            return true;
        }

        private static void ValidateDates(
            ProductAccessoryPriceDto dto)
        {
            if (dto.EffectiveTo.HasValue &&
                dto.EffectiveTo.Value.Date <
                dto.EffectiveFrom.Date)
            {
                throw new ArgumentException(
                    "Effective To cannot be earlier than Effective From.");
            }

            if (string.IsNullOrWhiteSpace(dto.ItemType) ||
                !(dto.ItemType.Equals(
                    "Product", StringComparison.OrdinalIgnoreCase) ||
                  dto.ItemType.Equals(
                    "Accessory", StringComparison.OrdinalIgnoreCase)))
            {
                throw new ArgumentException(
                    "ItemType must be Product or Accessory.");
            }

            if (dto.Amount < 0)
                throw new ArgumentException(
                    "Amount cannot be negative.");

            if (dto.MinQty < 1)
                throw new ArgumentException(
                    "Minimum quantity must be at least 1.");
        }
    }
}
