
using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTOs;
using Microsoft.EntityFrameworkCore;

using ProductPriceModel =
    CompanyPlatform.Core.Models.CRM.ProductPrice;

using PriceListModel =
    CompanyPlatform.Core.Models.CRM.PriceList;

using ProductModel =
    CompanyPlatform.Core.Models.CRM.Product;

namespace CompanyPlatform.CRM.Services
{
    public class ProductPriceService : IProductPriceService
    {
        private readonly ApplicationDBContext _context;

        public ProductPriceService(ApplicationDBContext context)
        {
            _context = context;
        }

        private static ProductPriceDto Map(ProductPriceModel x)
        {
            return new ProductPriceDto
            {
                ProductPriceId = x.ProductPriceId,
                PriceListId = x.PriceListId,
                ProductId = x.ProductId,
                PriceType = x.PriceType,
                Amount = x.Amount,
                MinQty = x.MinQty,
                EffectiveFrom = x.EffectiveFrom,
                EffectiveTo = x.EffectiveTo,
                IsActive = x.IsActive,
                IsDeleted = x.IsDeleted
            };
        }

        // GET: api/ProductPrice
        public async Task<IEnumerable<ProductPriceDto>> GetAllAsync()
        {
            var items = await _context
                .Set<ProductPriceModel>()
                .AsNoTracking()
                .Where(x => !x.IsDeleted)
                .ToListAsync();

            return items.Select(Map);
        }

        // GET: api/ProductPrice/{id}
        public async Task<ProductPriceDto?> GetByIdAsync(int id)
        {
            var item = await _context
                .Set<ProductPriceModel>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.ProductPriceId == id && !x.IsDeleted);

            return item == null ? null : Map(item);
        }

        // POST: api/ProductPrice
        public async Task<ProductPriceDto> CreateAsync(ProductPriceDto dto)
        {
            await ValidateAsync(dto);

            var item = new ProductPriceModel
            {
                PriceListId = dto.PriceListId,
                ProductId = dto.ProductId,
                PriceType = dto.PriceType,
                Amount = dto.Amount,
                MinQty = dto.MinQty,
                EffectiveFrom = dto.EffectiveFrom,
                EffectiveTo = dto.EffectiveTo,
                IsActive = dto.IsActive,
                IsDeleted = false
            };

            _context.Set<ProductPriceModel>().Add(item);
            await _context.SaveChangesAsync();

            return Map(item);
        }

        // PUT: api/ProductPrice/{id}
        public async Task<bool> UpdateAsync(int id, ProductPriceDto dto)
        {
            var item = await _context
                .Set<ProductPriceModel>()
                .FirstOrDefaultAsync(x =>
                    x.ProductPriceId == id && !x.IsDeleted);

            if (item == null)
                return false;

            await ValidateAsync(dto);

            item.PriceListId = dto.PriceListId;
            item.ProductId = dto.ProductId;
            item.PriceType = dto.PriceType;
            item.Amount = dto.Amount;
            item.MinQty = dto.MinQty;
            item.EffectiveFrom = dto.EffectiveFrom;
            item.EffectiveTo = dto.EffectiveTo;
            item.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return true;
        }

        // DELETE: api/ProductPrice/{id}
        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _context
                .Set<ProductPriceModel>()
                .FirstOrDefaultAsync(x =>
                    x.ProductPriceId == id && !x.IsDeleted);

            if (item == null)
                return false;

            item.IsDeleted = true;
            await _context.SaveChangesAsync();

            return true;
        }

        private async Task ValidateAsync(ProductPriceDto dto)
        {
            if (dto.PriceListId <= 0)
                throw new ArgumentException(
                    "PriceListId must be greater than zero.");

            if (dto.ProductId <= 0)
                throw new ArgumentException(
                    "ProductId must be greater than zero.");

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

            var priceListExists = await _context
                .Set<PriceListModel>()
                .AnyAsync(x =>
                    x.PriceListId == dto.PriceListId &&
                    !x.IsDeleted);

            if (!priceListExists)
                throw new ArgumentException("PriceListId is invalid.");

            var productExists = await _context
                .Set<ProductModel>()
                .AnyAsync(x =>
                    x.ProductId == dto.ProductId &&
                    !x.IsDeleted);

            if (!productExists)
                throw new ArgumentException("ProductId is invalid.");
        }
    }
}
