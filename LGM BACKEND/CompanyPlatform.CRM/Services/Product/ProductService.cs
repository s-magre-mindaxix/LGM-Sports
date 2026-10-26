
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO.Product;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Globalization;

namespace CompanyPlatform.CRM.Services.Product
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDBContext _context;

        public ProductService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<string> GeneratePartNumber(
            int vendorId,
            int typeCode,
            int originCode)
        {
            var vendor = await _context.Tbl_Vendors
                .FirstOrDefaultAsync(v => v.Id == vendorId);

            if (vendor == null)
                throw new Exception("Vendor not found.");

            if (string.IsNullOrWhiteSpace(vendor.VendorCode) ||
                vendor.VendorCode.Length < 2)
            {
                throw new Exception(
                    "Vendor code must contain at least two characters.");
            }

            string vendorNumber = vendor.VendorCode.Substring(
                vendor.VendorCode.Length - 2);

            string prefix = $"LGM{vendorNumber}{typeCode:D2}{originCode:D2}";

            var lastRecord = await _context.Tbl_Products
                .Where(p => p.ProductCode.StartsWith(prefix))
                .OrderByDescending(p => p.ProductCode)
                .Select(p => p.ProductCode)
                .FirstOrDefaultAsync();

            int nextSequence = 1;

            if (!string.IsNullOrWhiteSpace(lastRecord) &&
                lastRecord.Length > prefix.Length)
            {
                string serial = lastRecord.Substring(prefix.Length);

                if (int.TryParse(serial, out int lastNumber))
                    nextSequence = lastNumber + 1;
            }

            return $"{prefix}{nextSequence:D4}";
        }

        private async Task AdjustAccessoryStock(
            string? accessoryIds,
            string action,
            string productCode)
        {
            if (string.IsNullOrWhiteSpace(accessoryIds))
                return;

            var ids = accessoryIds
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(x => int.TryParse(x.Trim(), out int id) ? id : 0)
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            foreach (var id in ids)
            {
                var accessory = await _context.Tbl_Accessories.FindAsync(id);

                if (accessory == null)
                    continue;

                accessory.AvailableQuantity +=
                    action == "Subtract" ? -1 : 1;

                _context.Tbl_AccessoryLogs.Add(new AccessoryLog
                {
                    AccessoryId = id,
                    ActionType = action == "Subtract"
                        ? "Subtraction"
                        : "Addition",
                    Quantity = 1,
                    Reason = $"Product Code: {productCode}",
                    Timestamp = DateTime.Now
                });
            }
        }

        private static ProductCurrencyPriceDto MapCurrencyPrice(
            ProductCurrencyPrice cp)
        {
            return new ProductCurrencyPriceDto
            {
                CurrencyId = cp.CurrencyId,
                Price = cp.Price,
                CurrencyName = cp.Currency?.CurrencyName ?? string.Empty,
                CurrencySymbol = cp.Currency?.CurrencySymbol ?? string.Empty
            };
        }

        private static ProductDto MapProduct(
    CompanyPlatform.Core.Models.CRM.Product p)
        {
            return new ProductDto
            {
                ProductId = p.ProductId,
                ProductCode = p.ProductCode,
                ProductSKU = p.ProductSKU,
                PartNo = p.PartNo,
                ProductName = p.ProductName,

                ProductImagePath = p.ProductImage,

                ProductShortName = p.ProductShortName,
                CompanyNameOfProduct = p.CompanyNameOfProduct,

                ProductGroupId = p.ProductGroupId,
                CategoryId = p.CategoryId,
                ProductTypeId = p.ProductTypeId,

                // VariantId removed.
                VersionId = p.VersionId,
                CurrencyId = p.CurrencyId,
                PartConditionId = p.PartConditionId,

                ProductDescription = p.ProductDescription,
                Specification = p.Specification,
                ManufacturingDate = p.ManufacturingDate,
                ExpiryDate = p.ExpiryDate,
                WarrantyPeriod = p.WarrantyPeriod,
                HSNCode = p.HSNCode,
                HSN = p.HSNCode,
                UOM = p.UOM,
                HasAccessories = p.HasAccessories,
                MapAccessories = p.MapAccessories,

                PurchasePrice = p.PurchasePrice,
                SalePrice = p.SalePrice,
                SellingPrice = p.SalePrice,
                MRP = p.MRP,

                TaxPreference = p.TaxPreference,
                TaxRateId = p.TaxRateId,
                AvailableQuantity = p.AvailableQuantity,
                OutOfStockWarning = p.OutOfStockWarning,

                IsCalibration = p.IsCalibration,
                CalibrationFrequency = p.CalibrationFrequency,
                ProductSource = p.ProductSource,

                BCD = p.BCD,
                SWS = p.SWS,
                IGST = p.IGST,

                BrandId = p.BrandId,
                UnitId = p.UnitId,
                TaxId = p.TaxId,

                MinStock = p.MinStock,
                ReorderLevel = p.ReorderLevel,
                TrackStock = p.TrackStock,
                TrackSerial = p.TrackSerial,
                TrackBatch = p.TrackBatch,
                IsActive = p.IsActive,

                VendorId = p.VendorId ?? 0,
                VendorName = p.Vendor?.VendorName,
                VendorCode = p.Vendor?.VendorCode,

                CurrencyPrices = p.CurrencyPrices?
                    .Select(MapCurrencyPrice)
                    .ToList() ?? new List<ProductCurrencyPriceDto>()
            };
        }

        public async Task<List<ProductDto>> GetAllAsync()
        {
            var products = await _context.Tbl_Products
                .AsNoTracking()
                .Where(p => !p.IsDeleted)
                .Include(p => p.Vendor)
                .Include(p => p.CurrencyPrices)
                    .ThenInclude(cp => cp.Currency)
                .ToListAsync();

            return products.Select(MapProduct).ToList();
        }

        public async Task<ProductDto?> GetByIdAsync(int id)
        {
            var product = await _context.Tbl_Products
                .AsNoTracking()
                .Include(p => p.Vendor)
                .Include(p => p.CurrencyPrices)
                    .ThenInclude(cp => cp.Currency)
                .FirstOrDefaultAsync(p =>
                    p.ProductId == id && !p.IsDeleted);

            return product == null ? null : MapProduct(product);
        }

        public async Task<int> CreateAsync(ProductDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            if (string.IsNullOrWhiteSpace(dto.ProductName))
                throw new ArgumentException("Product name is required.");

            // Product image upload is disabled.
            // No IFormFile or image path is processed here.

            int typeCode = 1;

            int originCode = string.Equals(
                dto.ProductSource,
                "Imported",
                StringComparison.OrdinalIgnoreCase) ? 1 : 2;

            string productCode = await GeneratePartNumber(
                dto.VendorId,
                typeCode,
                originCode);

            var product = new CompanyPlatform.Core.Models.CRM.Product
            {
                ProductCode = productCode,
                ProductSKU = dto.ProductSKU,
                PartNo = dto.PartNo,
                ProductName = dto.ProductName,

                // ProductImage assignment is disabled.

                ProductShortName = dto.ProductShortName,
                CompanyNameOfProduct = dto.CompanyNameOfProduct,

                ProductGroupId = dto.ProductGroupId,
                CategoryId = dto.CategoryId,
                ProductTypeId = dto.ProductTypeId,
                VersionId = dto.VersionId,
                VendorId = dto.VendorId,
                CurrencyId = dto.CurrencyId,
                PartConditionId = dto.PartConditionId,

                ProductDescription = dto.ProductDescription,
                Specification = dto.Specification,
                ManufacturingDate = dto.ManufacturingDate,
                ExpiryDate = dto.ExpiryDate,
                WarrantyPeriod = dto.WarrantyPeriod,
                HSNCode = dto.HSNCode ?? dto.HSN,
                UOM = dto.UOM,
                HasAccessories = dto.HasAccessories,
                MapAccessories = dto.MapAccessories,

                PurchasePrice = dto.PurchasePrice,
                SalePrice = dto.SalePrice != 0
                    ? dto.SalePrice
                    : dto.SellingPrice,
                MRP = dto.MRP,

                TaxPreference = dto.TaxPreference,
                TaxRateId = dto.TaxRateId,

                AvailableQuantity = dto.AvailableQuantity,
                OutOfStockWarning = dto.OutOfStockWarning,

                IsCalibration = dto.IsCalibration,
                CalibrationFrequency = dto.IsCalibration
                    ? dto.CalibrationFrequency
                    : null,

                ProductSource = dto.ProductSource,

                BCD = originCode == 1 ? dto.BCD : 0,
                SWS = originCode == 1 ? dto.SWS : 0,
                IGST = originCode == 1 ? dto.IGST : 0,

                BrandId = dto.BrandId,
                UnitId = dto.UnitId,
                TaxId = dto.TaxId,

                MinStock = dto.MinStock,
                ReorderLevel = dto.ReorderLevel,
                TrackStock = dto.TrackStock,
                TrackSerial = dto.TrackSerial,
                TrackBatch = dto.TrackBatch,
                IsActive = dto.IsActive,

                CurrencyPrices = (dto.CurrencyPrices ??
                    new List<ProductCurrencyPriceDto>())
                    .Select(cp => new ProductCurrencyPrice
                    {
                        CurrencyId = cp.CurrencyId,
                        Price = cp.Price
                    }).ToList()
            };

            _context.Tbl_Products.Add(product);
            await _context.SaveChangesAsync();

            _context.Tbl_QualityAssurance.Add(new QualityAssurance
            {
                ItemType = "Product",
                ItemId = product.ProductId,
                ItemName = product.ProductName,
                ItemCode = product.ProductCode,
                Quantity = product.AvailableQuantity,
                Status = "Pending",
                Remarks = "Initial Entry from Product Master",
                CreatedDate = DateTime.Now
            });

            await _context.SaveChangesAsync();

            return product.ProductId;
        }

        public async Task<bool> UpdateAsync(ProductDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var product = await _context.Tbl_Products
                .Include(p => p.CurrencyPrices)
                .FirstOrDefaultAsync(p => p.ProductId == dto.ProductId);

            if (product == null)
                return false;

            if (product.MapAccessories != dto.MapAccessories)
            {
                await AdjustAccessoryStock(
                    product.MapAccessories,
                    "Add",
                    product.ProductCode);

                if (string.Equals(
                    dto.HasAccessories,
                    "Yes",
                    StringComparison.OrdinalIgnoreCase))
                {
                    await AdjustAccessoryStock(
                        dto.MapAccessories,
                        "Subtract",
                        product.ProductCode);
                }
            }

            // Product image upload/update is disabled.
            // No image-related properties are processed.

            product.PartNo = dto.PartNo;
            product.ProductSKU = dto.ProductSKU;
            product.ProductName = dto.ProductName;
            product.ProductShortName = dto.ProductShortName;
            product.CompanyNameOfProduct = dto.CompanyNameOfProduct;

            product.ProductGroupId = dto.ProductGroupId;
            product.CategoryId = dto.CategoryId;
            product.ProductTypeId = dto.ProductTypeId;
            product.VersionId = dto.VersionId;
            product.VendorId = dto.VendorId;
            product.CurrencyId = dto.CurrencyId;
            product.PartConditionId = dto.PartConditionId;

            product.ProductDescription = dto.ProductDescription;
            product.Specification = dto.Specification;
            product.ManufacturingDate = dto.ManufacturingDate;
            product.ExpiryDate = dto.ExpiryDate;
            product.WarrantyPeriod = dto.WarrantyPeriod;
            product.HSNCode = dto.HSNCode ?? dto.HSN;
            product.UOM = dto.UOM;
            product.HasAccessories = dto.HasAccessories;
            product.MapAccessories = dto.MapAccessories;

            product.PurchasePrice = dto.PurchasePrice;
            product.SalePrice = dto.SalePrice != 0
                ? dto.SalePrice
                : dto.SellingPrice;
            product.MRP = dto.MRP;

            product.TaxPreference = dto.TaxPreference;
            product.TaxRateId = dto.TaxRateId;
            product.AvailableQuantity = dto.AvailableQuantity;
            product.OutOfStockWarning = dto.OutOfStockWarning;

            product.IsCalibration = dto.IsCalibration;
            product.CalibrationFrequency = dto.IsCalibration
                ? dto.CalibrationFrequency
                : null;

            product.ProductSource = dto.ProductSource;

            bool isImported = string.Equals(
                dto.ProductSource,
                "Imported",
                StringComparison.OrdinalIgnoreCase);

            product.BCD = isImported ? dto.BCD : 0;
            product.SWS = isImported ? dto.SWS : 0;
            product.IGST = isImported ? dto.IGST : 0;

            product.BrandId = dto.BrandId;
            product.UnitId = dto.UnitId;
            product.TaxId = dto.TaxId;

            product.MinStock = dto.MinStock;
            product.ReorderLevel = dto.ReorderLevel;
            product.TrackStock = dto.TrackStock;
            product.TrackSerial = dto.TrackSerial;
            product.TrackBatch = dto.TrackBatch;
            product.IsActive = dto.IsActive;

            _context.Tbl_ProductCurrencyPrices.RemoveRange(
                product.CurrencyPrices);

            product.CurrencyPrices = (dto.CurrencyPrices ??
                new List<ProductCurrencyPriceDto>())
                .Select(cp => new ProductCurrencyPrice
                {
                    ProductId = product.ProductId,
                    CurrencyId = cp.CurrencyId,
                    Price = cp.Price
                }).ToList();

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _context.Tbl_Products
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
                return false;

            product.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }

        private static string NormalizeHeader(string header)
        {
            return new string(
                header.Trim()
                    .Where(char.IsLetterOrDigit)
                    .Select(char.ToLowerInvariant)
                    .ToArray());
        }

        private string GetCellValue(
            ExcelWorksheet worksheet,
            int row,
            Dictionary<string, int> headers,
            params string[] possibleHeaderNames)
        {
            foreach (var headerName in possibleHeaderNames)
            {
                string normalized = NormalizeHeader(headerName);

                if (headers.TryGetValue(normalized, out int column))
                {
                    return worksheet.Cells[row, column].Text?.Trim()
                        ?? string.Empty;
                }
            }

            return string.Empty;
        }

        private static int? ParseNullableInt(string value)
        {
            return int.TryParse(value, out int result)
                ? result
                : null;
        }

        private static int ParseInt(string value)
        {
            return int.TryParse(value, out int result)
                ? result
                : 0;
        }

        private static decimal ParseDecimal(string value)
        {
            return decimal.TryParse(
                value,
                NumberStyles.Any,
                CultureInfo.InvariantCulture,
                out decimal result)
                ? result
                : 0;
        }

        private static bool ParseBool(
            string value,
            bool defaultValue)
        {
            if (string.IsNullOrWhiteSpace(value))
                return defaultValue;

            if (value.Equals("1") ||
                value.Equals("true", StringComparison.OrdinalIgnoreCase) ||
                value.Equals("yes", StringComparison.OrdinalIgnoreCase))
                return true;

            if (value.Equals("0") ||
                value.Equals("false", StringComparison.OrdinalIgnoreCase) ||
                value.Equals("no", StringComparison.OrdinalIgnoreCase))
                return false;

            return defaultValue;
        }

        private static DateTime? ParseDate(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            if (DateTime.TryParse(
                value,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out DateTime result))
            {
                return result;
            }

            if (double.TryParse(
                value,
                NumberStyles.Any,
                CultureInfo.InvariantCulture,
                out double serialDate))
            {
                try
                {
                    return DateTime.FromOADate(serialDate);
                }
                catch (ArgumentException)
                {
                    return null;
                }
            }

            string[] formats =
            {
                "dd/MM/yyyy",
                "MM/dd/yyyy",
                "yyyy-MM-dd",
                "dd-MMM-yyyy"
            };

            return DateTime.TryParseExact(
                value,
                formats,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out DateTime exactDate)
                ? exactDate
                : null;
        }


        public async Task ImportProductsAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException(
                    "Please upload a valid Excel file.");

            if (!Path.GetExtension(file.FileName).Equals(
                ".xlsx",
                StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException(
                    "Only .xlsx Excel files are supported.");
            }

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            using var package = new ExcelPackage(stream);

            var worksheet = package.Workbook.Worksheets.FirstOrDefault();

            if (worksheet == null || worksheet.Dimension == null)
                throw new ArgumentException(
                    "The Excel file does not contain worksheet data.");

            var headers = new Dictionary<string, int>();

            for (int column = 1;
                 column <= worksheet.Dimension.End.Column;
                 column++)
            {
                string header = worksheet.Cells[1, column].Text;

                if (!string.IsNullOrWhiteSpace(header))
                    headers[NormalizeHeader(header)] = column;
            }

            if (!headers.ContainsKey("productname"))
                throw new ArgumentException(
                    "Excel must contain a ProductName column.");

            var products =
                new List<CompanyPlatform.Core.Models.CRM.Product>();

            var importedCodes = new HashSet<string>(
                StringComparer.OrdinalIgnoreCase);

            for (int row = 2;
                 row <= worksheet.Dimension.End.Row;
                 row++)
            {
                string productName = GetCellValue(
                    worksheet, row, headers,
                    "ProductName", "Product Name");

                if (string.IsNullOrWhiteSpace(productName))
                    continue;

                int vendorId = ParseInt(GetCellValue(
                    worksheet, row, headers, "VendorId", "Vendor Id"));

                if (vendorId <= 0)
                    throw new ArgumentException(
                        $"Invalid VendorId at Excel row {row}.");

                bool vendorExists = await _context.Tbl_Vendors
                    .AnyAsync(v => v.Id == vendorId);

                if (!vendorExists)
                    throw new ArgumentException(
                        $"VendorId {vendorId} does not exist at Excel row {row}.");

                int typeCode = ParseInt(GetCellValue(
                    worksheet, row, headers, "TypeCode"));

                if (typeCode <= 0)
                    typeCode = 1;

                string source = GetCellValue(
                    worksheet, row, headers, "ProductSource");

                if (string.IsNullOrWhiteSpace(source))
                    source = "Local";

                int originCode = string.Equals(
                    source,
                    "Imported",
                    StringComparison.OrdinalIgnoreCase) ? 1 : 2;

                string productCode = GetCellValue(
                    worksheet, row, headers, "ProductCode");

                if (string.IsNullOrWhiteSpace(productCode))
                {
                    productCode = await GeneratePartNumber(
                        vendorId, typeCode, originCode);
                }

                bool duplicateInDatabase = await _context.Tbl_Products
                    .AnyAsync(p => p.ProductCode == productCode);

                if (duplicateInDatabase ||
                    !importedCodes.Add(productCode))
                {
                    throw new ArgumentException(
                        $"Duplicate ProductCode '{productCode}' at Excel row {row}.");
                }

                bool isImported = originCode == 1;

                var product =
                    new CompanyPlatform.Core.Models.CRM.Product
                    {
                        ProductCode = productCode,
                        ProductSKU = GetCellValue(
                            worksheet, row, headers, "ProductSKU", "Product SKU"),
                        ProductName = productName,
                        VendorId = vendorId,

                        PartNo = GetCellValue(
                            worksheet, row, headers,
                            "PartNo", "Part Number"),

                        ProductShortName = GetCellValue(
                            worksheet, row, headers, "ProductShortName"),

                        CompanyNameOfProduct = GetCellValue(
                            worksheet, row, headers, "CompanyNameOfProduct"),

                        ProductDescription = GetCellValue(
                            worksheet, row, headers, "ProductDescription"),

                        Specification = GetCellValue(
                            worksheet, row, headers, "Specification"),

                        HSNCode = GetCellValue(
                            worksheet, row, headers, "HSNCode", "HSN"),

                        UOM = GetCellValue(
                            worksheet, row, headers, "UOM", "UnitOfMeasurement"),

                        ProductSource = source,

                        PurchasePrice = ParseDecimal(GetCellValue(
                            worksheet, row, headers, "PurchasePrice")),

                        SalePrice = ParseDecimal(GetCellValue(
                            worksheet, row, headers,
                            "SalePrice", "SellingPrice")),

                        MRP = ParseDecimal(GetCellValue(
                            worksheet, row, headers, "MRP")),

                        AvailableQuantity = ParseInt(GetCellValue(
                            worksheet, row, headers, "AvailableQuantity")),

                        OutOfStockWarning = ParseInt(GetCellValue(
                            worksheet, row, headers, "OutOfStockWarning")),

                        ManufacturingDate = ParseDate(GetCellValue(
                            worksheet, row, headers, "ManufacturingDate")),

                        ExpiryDate = ParseDate(GetCellValue(
                            worksheet, row, headers, "ExpiryDate")),

                        WarrantyPeriod = GetCellValue(
                            worksheet, row, headers, "WarrantyPeriod"),

                        TaxPreference = GetCellValue(
                            worksheet, row, headers, "TaxPreference"),

                        BrandId = ParseNullableInt(GetCellValue(
                            worksheet, row, headers, "BrandId")),

                        CategoryId = ParseNullableInt(GetCellValue(
                            worksheet, row, headers, "CategoryId")),

                        ProductGroupId = ParseNullableInt(GetCellValue(
                            worksheet, row, headers, "ProductGroupId")),

                        ProductTypeId = ParseNullableInt(GetCellValue(
                            worksheet, row, headers, "ProductTypeId")),

                        //VariantId = ParseNullableInt(GetCellValue(
                        //    worksheet, row, headers, "VariantId")),

                        VersionId = ParseNullableInt(GetCellValue(
                            worksheet, row, headers, "VersionId")),

                        UnitId = ParseNullableInt(GetCellValue(
                            worksheet, row, headers, "UnitId")),

                        TaxId = ParseNullableInt(GetCellValue(
                            worksheet, row, headers, "TaxId")),

                        TaxRateId = ParseNullableInt(GetCellValue(
                            worksheet, row, headers, "TaxRateId")),

                        MinStock = ParseDecimal(GetCellValue(
                            worksheet, row, headers, "MinStock")),

                        ReorderLevel = ParseDecimal(GetCellValue(
                            worksheet, row, headers, "ReorderLevel")),

                        TrackStock = ParseBool(GetCellValue(
                            worksheet, row, headers, "TrackStock"), true),

                        TrackSerial = ParseBool(GetCellValue(
                            worksheet, row, headers, "TrackSerial"), false),

                        TrackBatch = ParseBool(GetCellValue(
                            worksheet, row, headers, "TrackBatch"), false),

                        IsActive = ParseBool(GetCellValue(
                            worksheet, row, headers, "IsActive"), true),

                        IsCalibration = ParseBool(GetCellValue(
                            worksheet, row, headers, "IsCalibration"), false),

                        CalibrationFrequency = GetCellValue(
                            worksheet, row, headers, "CalibrationFrequency"),

                        BCD = isImported
                            ? ParseDecimal(GetCellValue(
                                worksheet, row, headers, "BCD"))
                            : 0,

                        SWS = isImported
                            ? ParseDecimal(GetCellValue(
                                worksheet, row, headers, "SWS"))
                            : 0,

                        IGST = isImported
                            ? ParseDecimal(GetCellValue(
                                worksheet, row, headers, "IGST"))
                            : 0
                    };

                products.Add(product);
            }

            if (products.Count == 0)
                throw new ArgumentException(
                    "No valid product rows were found in the Excel file.");

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                await _context.Tbl_Products.AddRangeAsync(products);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}