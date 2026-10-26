using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.ProductVariant;
using CompanyPlatform.Core.Services.ProductVariant;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Services.ProductVariant
{
    public class ProductVariantService : IProductVariantService
    {
        private readonly ApplicationDBContext _context;

        public ProductVariantService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<ProductVariantDto>> GetAllAsync()
        {
            return await _context.ProductVariant
                .AsNoTracking()
                .Where(x => !x.IsDeleted)
                .Select(x => new ProductVariantDto
                {
                    Id = x.Id,
                    VariantName = x.VariantName,
                    ProductId = x.ProductId,
                    VariantCode = x.VariantCode,
                    Attributes = x.Attributes,
                    Active = x.Active,
                    IsDeleted = x.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<ProductVariantDto?> GetByIdAsync(int id)
        {
            return await _context.ProductVariant
                .AsNoTracking()
                .Where(x => x.Id == id && !x.IsDeleted)
                .Select(x => new ProductVariantDto
                {
                    Id = x.Id,
                    VariantName = x.VariantName,
                    ProductId = x.ProductId,
                    VariantCode = x.VariantCode,
                    Attributes = x.Attributes,
                    Active = x.Active,
                    IsDeleted = x.IsDeleted
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ProductVariantDto> CreateAsync(ProductVariantDto dto)
        {
            var productExists = await _context.Tbl_Products
                .AnyAsync(p => p.ProductId == dto.ProductId && !p.IsDeleted);

            if (!productExists)
            {
                throw new ArgumentException("The specified product does not exist.");
            }

            var variant = new Models.Commonmaster.ProductVariant
            {
                VariantName = dto.VariantName,
                ProductId = dto.ProductId,
                VariantCode = dto.VariantCode,
                Attributes = dto.Attributes,
                Active = dto.Active,
                IsDeleted = false
            };

            _context.ProductVariant.Add(variant);
            await _context.SaveChangesAsync();

            dto.Id = variant.Id;
            dto.IsDeleted = variant.IsDeleted;

            return dto;
        }

        public async Task<bool> UpdateAsync(ProductVariantDto dto)
        {
            var variant = await _context.ProductVariant
                .FirstOrDefaultAsync(x => x.Id == dto.Id && !x.IsDeleted);

            if (variant == null)
                return false;

            var productExists = await _context.Tbl_Products
                .AnyAsync(p => p.ProductId == dto.ProductId && !p.IsDeleted);

            if (!productExists)
            {
                throw new ArgumentException("The specified product does not exist.");
            }

            variant.VariantName = dto.VariantName;
            variant.ProductId = dto.ProductId;
            variant.VariantCode = dto.VariantCode;
            variant.Attributes = dto.Attributes;
            variant.Active = dto.Active;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var variant = await _context.ProductVariant
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (variant == null)
                return false;

            variant.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}