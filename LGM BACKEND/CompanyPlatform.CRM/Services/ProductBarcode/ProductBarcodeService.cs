using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.ProductBarcode;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Services.ProductBarcode
{
    public class ProductBarcodeService : IProductBarcodeService
    {
        private readonly ApplicationDBContext _context;

        public ProductBarcodeService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<ProductBarcodeDto>> GetAllAsync()
        {
            return await _context.Tbl_ProductBarcodes
                .AsNoTracking()
                .Where(x => !x.IsDeleted)
                .Select(x => new ProductBarcodeDto
                {
                    Id = x.Id,
                    Barcode = x.Barcode,
                    BarcodeType = x.BarcodeType,
                    ProductId = x.ProductId,
                    VariantId = x.VariantId,
                    AccessoryId = x.AccessoryId,
                    IsPrimary = x.IsPrimary,
                    Active = x.Active,
                    IsDeleted = x.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<ProductBarcodeDto?> GetByIdAsync(int id)
        {
            return await _context.Tbl_ProductBarcodes
                .AsNoTracking()
                .Where(x => x.Id == id && !x.IsDeleted)
                .Select(x => new ProductBarcodeDto
                {
                    Id = x.Id,
                    Barcode = x.Barcode,
                    BarcodeType = x.BarcodeType,
                    ProductId = x.ProductId,
                    VariantId = x.VariantId,
                    AccessoryId = x.AccessoryId,
                    IsPrimary = x.IsPrimary,
                    Active = x.Active,
                    IsDeleted = x.IsDeleted
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ProductBarcodeDto> CreateAsync(ProductBarcodeDto dto)
        {
            await ValidateAsync(dto);

            string barcodeValue = dto.Barcode.Trim();

            bool duplicate = await _context.Tbl_ProductBarcodes
                .AnyAsync(x => x.Barcode == barcodeValue && !x.IsDeleted);

            if (duplicate)
                throw new ArgumentException("This barcode already exists.");

            var barcode = new CompanyPlatform.Core.Models.Commonmaster.ProductBarcode
            {
                Barcode = barcodeValue,
                BarcodeType = dto.BarcodeType.Trim(),
                ProductId = dto.ProductId,
                VariantId = dto.VariantId,
                AccessoryId = dto.AccessoryId,
                IsPrimary = dto.IsPrimary,
                Active = dto.Active,
                IsDeleted = false
            };

            _context.Tbl_ProductBarcodes.Add(barcode);
            await _context.SaveChangesAsync();

            dto.Id = barcode.Id;
            dto.Barcode = barcode.Barcode;
            dto.IsDeleted = barcode.IsDeleted;

            return dto;
        }

        public async Task<bool> UpdateAsync(ProductBarcodeDto dto)
        {
            var barcode = await _context.Tbl_ProductBarcodes
                .FirstOrDefaultAsync(x => x.Id == dto.Id && !x.IsDeleted);

            if (barcode == null)
                return false;

            await ValidateAsync(dto);

            string barcodeValue = dto.Barcode.Trim();

            bool duplicate = await _context.Tbl_ProductBarcodes
                .AnyAsync(x =>
                    x.Id != dto.Id &&
                    x.Barcode == barcodeValue &&
                    !x.IsDeleted);

            if (duplicate)
                throw new ArgumentException("This barcode already exists.");

            barcode.Barcode = barcodeValue;
            barcode.BarcodeType = dto.BarcodeType.Trim();
            barcode.ProductId = dto.ProductId;
            barcode.VariantId = dto.VariantId;
            barcode.AccessoryId = dto.AccessoryId;
            barcode.IsPrimary = dto.IsPrimary;
            barcode.Active = dto.Active;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var barcode = await _context.Tbl_ProductBarcodes
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (barcode == null)
                return false;

            barcode.IsDeleted = true;

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task ValidateAsync(ProductBarcodeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Barcode))
                throw new ArgumentException("Barcode is required.");

            if (string.IsNullOrWhiteSpace(dto.BarcodeType))
                throw new ArgumentException("BarcodeType is required.");

            int selectedReferences =
                (dto.ProductId.HasValue ? 1 : 0) +
                (dto.VariantId.HasValue ? 1 : 0) +
                (dto.AccessoryId.HasValue ? 1 : 0);

            if (selectedReferences != 1)
                throw new ArgumentException(
                    "Provide exactly one of ProductId, VariantId, or AccessoryId.");

            if (dto.ProductId.HasValue)
            {
                bool exists = await _context.Tbl_Products
                    .AnyAsync(x =>
                        x.ProductId == dto.ProductId.Value &&
                        !x.IsDeleted);

                if (!exists)
                    throw new ArgumentException("The specified product does not exist.");
            }

            if (dto.VariantId.HasValue)
            {
                bool exists = await _context.ProductVariant
                    .AnyAsync(x =>
                        x.Id == dto.VariantId.Value &&
                        !x.IsDeleted);

                if (!exists)
                    throw new ArgumentException("The specified product variant does not exist.");
            }

            if (dto.AccessoryId.HasValue)
            {
                bool exists = await _context.Tbl_Accessories
                    .AnyAsync(x =>
                        x.AccessoriesId == dto.AccessoryId.Value &&
                        !x.IsDeleted);

                if (!exists)
                    throw new ArgumentException("The specified accessory does not exist.");
            }
        }
    }
}