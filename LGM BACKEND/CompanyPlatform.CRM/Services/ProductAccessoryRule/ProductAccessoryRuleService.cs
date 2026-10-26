
using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO.ProductAccessoryRule;
using Microsoft.EntityFrameworkCore;
using ProductAccessoryRuleModel =
    CompanyPlatform.Core.Models.CRM.ProductAccessoryRule;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.ProductAccessoryRule
{
    public class ProductAccessoryRuleService : IProductAccessoryRuleService
    {
        private readonly ApplicationDBContext _context;

        public ProductAccessoryRuleService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<ProductAccessoryRuleDto>> GetAllAsync()
        {
            return await _context.Set<ProductAccessoryRuleModel>()
                .AsNoTracking()
                .Where(x => !x.IsDeleted)
                .Select(x => new ProductAccessoryRuleDto
                {
                    Id = x.Id,
                    ProductId = x.ProductId,
                    ProductName = x.Product != null
                        ? x.Product.ProductName
                        : null,

                    AccessoriesId = x.AccessoriesId,
                    AccessoryName = x.Accessory != null
                        ? x.Accessory.AccessoriesName
                        : null,

                    Quantity = x.Quantity,
                    MandatoryOptional = x.MandatoryOptional,
                    PricingType = x.PricingType,
                    DefaultPrice = x.DefaultPrice,
                    EffectiveFrom = x.EffectiveFrom,
                    EffectiveTo = x.EffectiveTo,
                    Active = x.Active
                })
                .ToListAsync();
        }

        public async Task<ProductAccessoryRuleDto?> GetByIdAsync(int id)
        {
            return await _context.Set<ProductAccessoryRuleModel>()
                .AsNoTracking()
                .Where(x => x.Id == id && !x.IsDeleted)
                .Select(x => new ProductAccessoryRuleDto
                {
                    Id = x.Id,
                    ProductId = x.ProductId,
                    ProductName = x.Product != null
                        ? x.Product.ProductName
                        : null,

                    AccessoriesId = x.AccessoriesId,
                    AccessoryName = x.Accessory != null
                        ? x.Accessory.AccessoriesName
                        : null,

                    Quantity = x.Quantity,
                    MandatoryOptional = x.MandatoryOptional,
                    PricingType = x.PricingType,
                    DefaultPrice = x.DefaultPrice,
                    EffectiveFrom = x.EffectiveFrom,
                    EffectiveTo = x.EffectiveTo,
                    Active = x.Active
                })
                .FirstOrDefaultAsync();
        }

        public async Task<int> CreateAsync(ProductAccessoryRuleDto dto)
        {
            Validate(dto);

            var entity = new ProductAccessoryRuleModel
            {
                ProductId = dto.ProductId,
                AccessoriesId = dto.AccessoriesId,
                Quantity = dto.Quantity,
                MandatoryOptional = dto.MandatoryOptional,
                PricingType = dto.PricingType,
                DefaultPrice = dto.DefaultPrice,
                EffectiveFrom = dto.EffectiveFrom,
                EffectiveTo = dto.EffectiveTo,
                Active = dto.Active,
                IsDeleted = false
            };

            _context.Set<ProductAccessoryRuleModel>().Add(entity);

            await _context.SaveChangesAsync();

            return entity.Id;
        }

        public async Task<bool> UpdateAsync(ProductAccessoryRuleDto dto)
        {
            Validate(dto);

            var entity = await _context
                .Set<ProductAccessoryRuleModel>()
                .FirstOrDefaultAsync(x =>
                    x.Id == dto.Id && !x.IsDeleted);

            if (entity == null)
                return false;

            entity.ProductId = dto.ProductId;
            entity.AccessoriesId = dto.AccessoriesId;
            entity.Quantity = dto.Quantity;
            entity.MandatoryOptional = dto.MandatoryOptional;
            entity.PricingType = dto.PricingType;
            entity.DefaultPrice = dto.DefaultPrice;
            entity.EffectiveFrom = dto.EffectiveFrom;
            entity.EffectiveTo = dto.EffectiveTo;
            entity.Active = dto.Active;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context
                .Set<ProductAccessoryRuleModel>()
                .FirstOrDefaultAsync(x =>
                    x.Id == id && !x.IsDeleted);

            if (entity == null)
                return false;

            entity.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }

        private static void Validate(ProductAccessoryRuleDto dto)
        {
            if (dto.ProductId <= 0)
                throw new ArgumentException(
                    "Valid ProductId is required.");

            if (dto.AccessoriesId <= 0)
                throw new ArgumentException(
                    "Valid AccessoriesId is required.");

            if (dto.Quantity <= 0)
                throw new ArgumentException(
                    "Quantity must be greater than zero.");

            if (dto.DefaultPrice < 0)
                throw new ArgumentException(
                    "DefaultPrice cannot be negative.");

            if (string.IsNullOrWhiteSpace(dto.MandatoryOptional) ||
                !new[] { "Mandatory", "Optional" }.Contains(
                    dto.MandatoryOptional,
                    StringComparer.OrdinalIgnoreCase))
            {
                throw new ArgumentException(
                    "MandatoryOptional must be Mandatory or Optional.");
            }

            if (string.IsNullOrWhiteSpace(dto.PricingType))
                throw new ArgumentException(
                    "PricingType is required.");

            if (dto.EffectiveTo.HasValue &&
                dto.EffectiveTo.Value < dto.EffectiveFrom)
            {
                throw new ArgumentException(
                    "EffectiveTo cannot be earlier than EffectiveFrom.");
            }
        }
    }
}
