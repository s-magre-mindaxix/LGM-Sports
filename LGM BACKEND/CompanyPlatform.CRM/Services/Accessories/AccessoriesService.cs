using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.Core.Models.CRM.Dashboards;
using CompanyPlatform.CRM.DTO.Accessories;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Globalization;

namespace CompanyPlatform.CRM.Services.Accessories
{
    public class AccessoriesService : IAccessoriesService
    {
        private readonly ApplicationDBContext _context;

        public AccessoriesService(ApplicationDBContext context)
        {
            _context = context;
        }

        // Generate accessory code
        public async Task<string> GenerateAccessoryCode(
            int vendorId,
            string productSource)
        {
            if (vendorId <= 0)
                throw new ArgumentException("Valid VendorId is required.");

            var vendor = await _context.Tbl_Vendors
                .FirstOrDefaultAsync(v =>
                    v.Id == vendorId && !v.IsDeleted);

            if (vendor == null)
                throw new KeyNotFoundException(
                    $"Vendor not found for ID {vendorId}.");

            if (string.IsNullOrWhiteSpace(vendor.VendorCode) ||
                vendor.VendorCode.Trim().Length < 2)
            {
                throw new InvalidOperationException(
                    "VendorCode must contain at least two characters.");
            }

            string vendorNumber = vendor.VendorCode.Trim()[^2..];

            bool imported = string.Equals(
                productSource,
                "Imported",
                StringComparison.OrdinalIgnoreCase);

            string prefix = $"GX{vendorNumber}02{(imported ? 1 : 2):D2}";

            var existingCodes = await _context.Tbl_Accessories
                .Where(x => x.AccessoriesCode.StartsWith(prefix))
                .Select(x => x.AccessoriesCode)
                .ToListAsync();

            int nextSequence = existingCodes
                .Select(code =>
                {
                    string suffix = code.Length > prefix.Length
                        ? code[prefix.Length..]
                        : string.Empty;

                    return int.TryParse(suffix, out int number)
                        ? number
                        : 0;
                })
                .DefaultIfEmpty(0)
                .Max() + 1;

            return $"{prefix}{nextSequence:D4}";
        }

        // Save an uploaded accessory image.
        // Returns a relative URL to store in the database.
        private static async Task<string?> SaveImageAsync(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return null;

            const long maxFileSize = 5 * 1024 * 1024;

            if (file.Length > maxFileSize)
                throw new ArgumentException(
                    "Image size must not exceed 5 MB.");

            string extension = Path.GetExtension(file.FileName)
                .ToLowerInvariant();

            string[] allowedExtensions =
            {
                ".jpg", ".jpeg", ".png", ".webp"
            };

            if (!allowedExtensions.Contains(extension))
                throw new ArgumentException(
                    "Only JPG, JPEG, PNG and WEBP images are allowed.");

            string uploadDirectory = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads",
                "accessories");

            Directory.CreateDirectory(uploadDirectory);

            string fileName = $"{Guid.NewGuid():N}{extension}";

            string fullPath = Path.Combine(
                uploadDirectory,
                fileName);

            await using (var stream = new FileStream(
                fullPath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/accessories/{fileName}";
        }

        // Map entity to DTO
        private static AccessoriesDto MapToDto(
            Core.Models.CRM.Accessories item)
        {
            return new AccessoriesDto
            {
                AccessoriesId = item.AccessoriesId,
                AccessoriesCode = item.AccessoriesCode,
                AccessorySKU = item.AccessorySKU,
                AccessoriesName = item.AccessoriesName,
                PartNo = item.PartNo,

                VendorId = item.VendorId,
                VendorName = item.Vendor?.VendorName,
                VendorCode = item.Vendor?.VendorCode,

                // Existing image URL/path
                AccessoriesImage = item.AccessoriesImage,

                AccessoriesShortName = item.AccessoriesShortName,
                CompanyNameOfProduct = item.CompanyNameOfProduct,

                ProductGroupId = item.ProductGroupId,
                CategoryId = item.CategoryId,
                BrandId = item.BrandId,
                UnitId = item.UnitId,
                TaxId = item.TaxId,

                ProductTypeId = item.ProductTypeId,
                //VariantId = item.VariantId,
                VersionId = item.VersionId,
                CurrencyId = item.CurrencyId,
                PartConditionId = item.PartConditionId,

                AccessoriesDescription = item.AccessoriesDescription,
                Specification = item.Specification,
                PartUnique = item.PartUnique,

                ManufacturingDate = item.ManufacturingDate,
                ExpiryDate = item.ExpiryDate,
                WarrantyPeriod = item.WarrantyPeriod,

                HSNCode = item.HSNCode,
                UOM = item.UOM,
                TaxPreference = item.TaxPreference,
                TaxRateId = item.TaxRateId,

                PurchasePrice = item.PurchasePrice,
                SalePrice = item.SalePrice,

                AvailableQuantity = item.AvailableQuantity,
                OutOfStockWarning = item.OutOfStockWarning,
                MinStock = item.MinStock,
                TrackStock = item.TrackStock,

                Active = item.Active,
                ProductSource = item.ProductSource,

                BCD = item.BCD,
                SWS = item.SWS,
                IGST = item.IGST,

                IsCalibration = item.IsCalibration,
                CalibrationFrequency = item.CalibrationFrequency,

                CurrencyPrices = item.CurrencyPrices?
                    .Select(cp => new AccessoryCurrencyPriceDto
                    {
                        CurrencyId = cp.CurrencyId,
                        Price = cp.Price,
                        CurrencyName = cp.Currency?.CurrencyName,
                        CurrencySymbol = cp.Currency?.CurrencySymbol
                    })
                    .ToList() ?? new List<AccessoryCurrencyPriceDto>()
            };
        }

        // Get all accessories
        public async Task<List<AccessoriesDto>> GetAllAsync()
        {
            var accessories = await _context.Tbl_Accessories
                .AsNoTracking()
                .Where(x => !x.IsDeleted)
                .Include(x => x.Vendor)
                .Include(x => x.CurrencyPrices)
                    .ThenInclude(x => x.Currency)
                .ToListAsync();

            return accessories.Select(MapToDto).ToList();
        }

        // Get accessory by ID
        public async Task<AccessoriesDto> GetByIdAsync(int id)
        {
            var accessory = await _context.Tbl_Accessories
                .AsNoTracking()
                .Where(x =>
                    x.AccessoriesId == id &&
                    !x.IsDeleted)
                .Include(x => x.Vendor)
                .Include(x => x.CurrencyPrices)
                    .ThenInclude(x => x.Currency)
                .FirstOrDefaultAsync();

            if (accessory == null)
                throw new KeyNotFoundException(
                    $"Accessory with ID {id} was not found.");

            return MapToDto(accessory);
        }

        // Create accessory
        public async Task<int> CreateAsync(AccessoriesDto dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            if (string.IsNullOrWhiteSpace(dto.AccessoriesName))
                throw new ArgumentException(
                    "AccessoriesName is required.");

            if (!dto.VendorId.HasValue || dto.VendorId.Value <= 0)
                throw new ArgumentException(
                    "Valid VendorId is required.");

            string source = string.Equals(
                dto.ProductSource,
                "Imported",
                StringComparison.OrdinalIgnoreCase)
                ? "Imported"
                : "Local";

            // Save uploaded image, if supplied.
            string? imagePath = await SaveImageAsync(
                dto.AccessoriesImageFile);

            var accessory = new Core.Models.CRM.Accessories
            {
                AccessoriesCode = await GenerateAccessoryCode(
                    dto.VendorId.Value,
                    source),

                AccessoriesName = dto.AccessoriesName.Trim(),
                AccessorySKU = dto.AccessorySKU,
                PartNo = dto.PartNo,
                VendorId = dto.VendorId,

                AccessoriesImage = imagePath ?? dto.AccessoriesImage,

                AccessoriesShortName = dto.AccessoriesShortName,
                CompanyNameOfProduct = dto.CompanyNameOfProduct,

                ProductGroupId = dto.ProductGroupId,
                CategoryId = dto.CategoryId,
                BrandId = dto.BrandId,
                UnitId = dto.UnitId,
                TaxId = dto.TaxId,

                ProductTypeId = dto.ProductTypeId,
                //VariantId = dto.VariantId,
                VersionId = dto.VersionId,
                CurrencyId = dto.CurrencyId,
                PartConditionId = dto.PartConditionId,

                AccessoriesDescription = dto.AccessoriesDescription,
                Specification = dto.Specification,
                PartUnique = dto.PartUnique,

                ManufacturingDate = dto.ManufacturingDate,
                ExpiryDate = dto.ExpiryDate,
                WarrantyPeriod = dto.WarrantyPeriod,

                HSNCode = dto.HSNCode,
                UOM = dto.UOM,
                TaxPreference = dto.TaxPreference,
                TaxRateId = dto.TaxRateId,

                PurchasePrice = dto.PurchasePrice,
                SalePrice = dto.SalePrice,

                AvailableQuantity = dto.AvailableQuantity,
                OutOfStockWarning = dto.OutOfStockWarning,
                MinStock = dto.MinStock,
                TrackStock = dto.TrackStock,

                Active = dto.Active,
                ProductSource = source,

                BCD = source == "Imported" ? dto.BCD : 0,
                SWS = source == "Imported" ? dto.SWS : 0,
                IGST = source == "Imported" ? dto.IGST : 0,

                IsCalibration = dto.IsCalibration,
                CalibrationFrequency = dto.IsCalibration
                    ? dto.CalibrationFrequency
                    : null,

                CurrencyPrices = (dto.CurrencyPrices
                    ?? new List<AccessoryCurrencyPriceDto>())
                    .Select(cp => new AccessoryCurrencyPrice
                    {
                        CurrencyId = cp.CurrencyId,
                        Price = cp.Price
                    })
                    .ToList()
            };

            _context.Tbl_Accessories.Add(accessory);
            await _context.SaveChangesAsync();

            _context.Tbl_QualityAssurance.Add(new QualityAssurance
            {
                ItemType = "Accessory",
                ItemId = accessory.AccessoriesId,
                ItemName = accessory.AccessoriesName,
                ItemCode = accessory.AccessoriesCode,
                Quantity = accessory.AvailableQuantity,
                Status = "Pending",
                Remarks = "Initial Entry from Accessory Master",
                CreatedDate = DateTime.Now
            });

            await _context.SaveChangesAsync();

            return accessory.AccessoriesId;
        }

        // Update accessory
        public async Task<bool> UpdateAsync(AccessoriesDto dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var accessory = await _context.Tbl_Accessories
                .Include(x => x.CurrencyPrices)
                .FirstOrDefaultAsync(x =>
                    x.AccessoriesId == dto.AccessoriesId &&
                    !x.IsDeleted);

            if (accessory == null)
                return false;

            if (string.IsNullOrWhiteSpace(dto.AccessoriesName))
                throw new ArgumentException(
                    "AccessoriesName is required.");

            // Replace the image only if a new file is uploaded.
            string? newImagePath = await SaveImageAsync(
                dto.AccessoriesImageFile);

            if (newImagePath != null)
            {
                accessory.AccessoriesImage = newImagePath;
            }
            else if (!string.IsNullOrWhiteSpace(dto.AccessoriesImage))
            {
                accessory.AccessoriesImage = dto.AccessoriesImage;
            }

            accessory.AccessoriesName = dto.AccessoriesName.Trim();
            accessory.AccessorySKU = dto.AccessorySKU;
            accessory.PartNo = dto.PartNo;
            accessory.AccessoriesShortName = dto.AccessoriesShortName;
            accessory.CompanyNameOfProduct = dto.CompanyNameOfProduct;

            accessory.VendorId = dto.VendorId;
            accessory.ProductGroupId = dto.ProductGroupId;
            accessory.CategoryId = dto.CategoryId;
            accessory.BrandId = dto.BrandId;
            accessory.UnitId = dto.UnitId;
            accessory.TaxId = dto.TaxId;

            accessory.ProductTypeId = dto.ProductTypeId;
            //accessory.VariantId = dto.VariantId;
            accessory.VersionId = dto.VersionId;
            accessory.CurrencyId = dto.CurrencyId;
            accessory.PartConditionId = dto.PartConditionId;

            accessory.AccessoriesDescription = dto.AccessoriesDescription;
            accessory.Specification = dto.Specification;
            accessory.PartUnique = dto.PartUnique;

            accessory.ManufacturingDate = dto.ManufacturingDate;
            accessory.ExpiryDate = dto.ExpiryDate;
            accessory.WarrantyPeriod = dto.WarrantyPeriod;

            accessory.HSNCode = dto.HSNCode;
            accessory.UOM = dto.UOM;
            accessory.TaxPreference = dto.TaxPreference;
            accessory.TaxRateId = dto.TaxRateId;

            accessory.PurchasePrice = dto.PurchasePrice;
            accessory.SalePrice = dto.SalePrice;

            accessory.AvailableQuantity = dto.AvailableQuantity;
            accessory.OutOfStockWarning = dto.OutOfStockWarning;
            accessory.MinStock = dto.MinStock;
            accessory.TrackStock = dto.TrackStock;
            accessory.Active = dto.Active;

            accessory.ProductSource = string.Equals(
                dto.ProductSource,
                "Imported",
                StringComparison.OrdinalIgnoreCase)
                ? "Imported"
                : "Local";

            accessory.BCD = accessory.ProductSource == "Imported"
                ? dto.BCD
                : 0;

            accessory.SWS = accessory.ProductSource == "Imported"
                ? dto.SWS
                : 0;

            accessory.IGST = accessory.ProductSource == "Imported"
                ? dto.IGST
                : 0;

            accessory.IsCalibration = dto.IsCalibration;
            accessory.CalibrationFrequency = dto.IsCalibration
                ? dto.CalibrationFrequency
                : null;

            // Replace existing currency prices.
            var oldPrices = await _context.Tbl_AccessoryCurrencyPrices
                .Where(x => x.AccessoriesId == accessory.AccessoriesId)
                .ToListAsync();

            _context.Tbl_AccessoryCurrencyPrices.RemoveRange(oldPrices);

            foreach (var price in dto.CurrencyPrices
                         ?? new List<AccessoryCurrencyPriceDto>())
            {
                _context.Tbl_AccessoryCurrencyPrices.Add(
                    new AccessoryCurrencyPrice
                    {
                        AccessoriesId = accessory.AccessoriesId,
                        CurrencyId = price.CurrencyId,
                        Price = price.Price
                    });
            }

            await _context.SaveChangesAsync();

            return true;
        }

        // Soft delete accessory
        public async Task<bool> DeleteAsync(int id)
        {
            var accessory = await _context.Tbl_Accessories
                .FirstOrDefaultAsync(x =>
                    x.AccessoriesId == id &&
                    !x.IsDeleted);

            if (accessory == null)
                return false;

            accessory.IsDeleted = true;

            await _context.SaveChangesAsync();

            return true;
        }

        // Get accessory logs
        public async Task<List<AccessoryLog>> GetLogsAsync(int id)
        {
            return await _context.Tbl_AccessoryLogs
                .AsNoTracking()
                .Where(x => x.AccessoryId == id)
                .OrderByDescending(x => x.Timestamp)
                .ToListAsync();
        }

        // Import accessories from Excel
        public async Task ImportAccessoriesAsync(IFormFile file)
        {
            ArgumentNullException.ThrowIfNull(file);

            if (file.Length == 0)
                throw new ArgumentException(
                    "The uploaded Excel file is empty.");

            ExcelPackage.License.SetNonCommercialOrganization(
                "CompanyPlatform");

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets.FirstOrDefault();

            if (worksheet?.Dimension == null)
                throw new InvalidOperationException(
                    "Excel worksheet is empty.");

            int rowCount = worksheet.Dimension.Rows;
            int columnCount = worksheet.Dimension.Columns;

            var headers = new Dictionary<string, int>(
                StringComparer.OrdinalIgnoreCase);

            for (int col = 1; col <= columnCount; col++)
            {
                string header = NormalizeHeader(
                    worksheet.Cells[1, col].Text);

                if (!string.IsNullOrWhiteSpace(header))
                    headers[header] = col;
            }

            for (int row = 2; row <= rowCount; row++)
            {
                try
                {
                    bool emptyRow = Enumerable.Range(1, columnCount)
                        .All(col => string.IsNullOrWhiteSpace(
                            worksheet.Cells[row, col].Text));

                    if (emptyRow)
                        continue;

                    string code = GetCellValue(
                        worksheet, row, headers,
                        "accessoriescode", "accessories_code");

                    string name = GetCellValue(
                        worksheet, row, headers,
                        "accessoriesname", "accessories_name");

                    if (string.IsNullOrWhiteSpace(code) ||
                        string.IsNullOrWhiteSpace(name))
                    {
                        Console.WriteLine(
                            $"Row {row}: AccessoriesCode or AccessoriesName is missing.");
                        continue;
                    }

                    code = code.Trim();

                    var accessory = await _context.Tbl_Accessories
                        .FirstOrDefaultAsync(x =>
                            x.AccessoriesCode == code);

                    string source = GetCellValue(
                        worksheet, row, headers,
                        "productsource", "product_source");

                    source = string.Equals(
                        source,
                        "Imported",
                        StringComparison.OrdinalIgnoreCase)
                        ? "Imported"
                        : "Local";

                    bool isNew = accessory == null;

                    accessory ??= new Core.Models.CRM.Accessories();

                    accessory.AccessoriesCode = code;
                    accessory.AccessoriesName = name.Trim();

                    accessory.PartNo = GetCellValue(
                        worksheet, row, headers,
                        "partno", "part_no");
                    accessory.AccessorySKU = GetCellValue(
                    worksheet, row, headers,
                    "accessorysku", "accessory_sku");
                    accessory.VendorId = ParseNullableInt(
                        GetCellValue(worksheet, row, headers,
                            "vendorid", "vendor_id", "fk_vendor_id"));

                    accessory.ProductGroupId = ParseNullableInt(
                        GetCellValue(worksheet, row, headers,
                            "productgroupid", "product_group_id"));

                    accessory.CategoryId = ParseNullableInt(
                        GetCellValue(worksheet, row, headers,
                            "categoryid", "category_id"));

                    accessory.BrandId = ParseNullableInt(
                        GetCellValue(worksheet, row, headers,
                            "brandid", "brand_id"));

                    accessory.UnitId = ParseNullableInt(
                        GetCellValue(worksheet, row, headers,
                            "unitid", "unit_id"));

                    accessory.TaxId = ParseNullableInt(
                        GetCellValue(worksheet, row, headers,
                            "taxid", "tax_id"));

                    accessory.ProductTypeId = ParseNullableInt(
                        GetCellValue(worksheet, row, headers,
                            "producttypeid", "product_type_id"));

                    //accessory.VariantId = ParseNullableInt(
                    //    GetCellValue(worksheet, row, headers,
                    //        "variantid", "variant_id"));

                    accessory.VersionId = ParseNullableInt(
                        GetCellValue(worksheet, row, headers,
                            "versionid", "version_id"));

                    accessory.CurrencyId = ParseNullableInt(
                        GetCellValue(worksheet, row, headers,
                            "currencyid", "currency_id"));

                    accessory.PartConditionId = ParseNullableInt(
                        GetCellValue(worksheet, row, headers,
                            "partconditionid", "part_condition_id"));

                    accessory.AccessoriesShortName = GetCellValue(
                        worksheet, row, headers,
                        "accessoriesshortname", "accessories_short_name");

                    accessory.CompanyNameOfProduct = GetCellValue(
                        worksheet, row, headers,
                        "companynameofproduct", "company_name_of_product");

                    accessory.AccessoriesDescription = GetCellValue(
                        worksheet, row, headers,
                        "accessoriesdescription", "accessories_description");

                    accessory.Specification = GetCellValue(
                        worksheet, row, headers, "specification");

                    accessory.PartUnique = GetCellValue(
                        worksheet, row, headers,
                        "partunique", "part_unique");

                    accessory.UOM = GetCellValue(
                        worksheet, row, headers, "uom");

                    accessory.HSNCode = GetCellValue(
                        worksheet, row, headers,
                        "hsncode", "hsn_code");

                    accessory.WarrantyPeriod = GetCellValue(
                        worksheet, row, headers,
                        "warrantyperiod", "warranty_period");

                    accessory.TaxPreference = GetCellValue(
                        worksheet, row, headers,
                        "taxpreference", "tax_preference");

                    accessory.PurchasePrice = ParseDecimal(
                        GetCellValue(worksheet, row, headers,
                            "purchaseprice", "purchase_price"));

                    accessory.SalePrice = ParseDecimal(
                        GetCellValue(worksheet, row, headers,
                            "saleprice", "sale_price"));

                    accessory.TaxRateId = ParseNullableInt(
                        GetCellValue(worksheet, row, headers,
                            "taxrateid", "tax_rate_id"));

                    accessory.AvailableQuantity = ParseInt(
                        GetCellValue(worksheet, row, headers,
                            "availablequantity", "available_quantity"));

                    accessory.OutOfStockWarning = ParseInt(
                        GetCellValue(worksheet, row, headers,
                            "outofstockwarning", "out_of_stock_warning"));

                    accessory.MinStock = ParseInt(
                        GetCellValue(worksheet, row, headers,
                            "minstock", "min_stock"));

                    accessory.TrackStock = ParseBool(
                        GetCellValue(worksheet, row, headers,
                            "trackstock", "track_stock"));

                    accessory.Active = ParseBool(
                        GetCellValue(worksheet, row, headers,
                            "active", "isactive"));

                    accessory.ProductSource = source;

                    accessory.BCD = source == "Imported"
                        ? ParseDecimal(GetCellValue(
                            worksheet, row, headers, "bcd"))
                        : 0;

                    accessory.SWS = source == "Imported"
                        ? ParseDecimal(GetCellValue(
                            worksheet, row, headers, "sws"))
                        : 0;

                    accessory.IGST = source == "Imported"
                        ? ParseDecimal(GetCellValue(
                            worksheet, row, headers, "igst"))
                        : 0;

                    accessory.ManufacturingDate = ParseDate(
                        GetCellValue(worksheet, row, headers,
                            "manufacturingdate", "manufacturing_date"));

                    accessory.ExpiryDate = ParseDate(
                        GetCellValue(worksheet, row, headers,
                            "expirydate", "expiry_date"));

                    accessory.IsCalibration = ParseBool(
                        GetCellValue(worksheet, row, headers,
                            "iscalibration", "is_calibration"));

                    accessory.CalibrationFrequency =
                        accessory.IsCalibration
                            ? GetCellValue(worksheet, row, headers,
                                "calibrationfrequency",
                                "calibration_frequency")
                            : null;

                    accessory.IsDeleted = ParseBool(
                        GetCellValue(worksheet, row, headers,
                            "isdeleted", "is_deleted"));

                    if (isNew)
                    {
                        _context.Tbl_Accessories.Add(accessory);
                    }

                    await _context.SaveChangesAsync();

                    Console.WriteLine(
                        $"Row {row}: Imported accessory {code}.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"Row {row} failed: {ex.Message}");
                }
            }
        }

        private static string NormalizeHeader(string? value)
        {
            return (value ?? string.Empty)
                .Trim()
                .ToLowerInvariant()
                .Replace(" ", "_");
        }

        private static string GetCellValue(
            ExcelWorksheet worksheet,
            int row,
            Dictionary<string, int> headers,
            params string[] possibleNames)
        {
            foreach (string name in possibleNames)
            {
                string normalizedName = NormalizeHeader(name);

                if (headers.TryGetValue(normalizedName, out int col))
                {
                    return worksheet.Cells[row, col].Text?.Trim()
                        ?? string.Empty;
                }
            }

            return string.Empty;
        }

        private static decimal ParseDecimal(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return 0;

            if (decimal.TryParse(
                value,
                NumberStyles.Any,
                CultureInfo.InvariantCulture,
                out decimal result))
            {
                return result;
            }

            return decimal.TryParse(value, out result) ? result : 0;
        }

        private static int ParseInt(string? value)
        {
            return int.TryParse(value, out int result) ? result : 0;
        }

        private static int? ParseNullableInt(string? value)
        {
            return int.TryParse(value, out int result) && result > 0
                ? result
                : null;
        }

        private static bool ParseBool(string? value)
        {
            return value?.Trim().ToLowerInvariant() is
                "1" or "true" or "yes" or "y";
        }

        private static DateTime? ParseDate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            if (DateTime.TryParse(
                value,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out DateTime date))
            {
                return date;
            }

            if (double.TryParse(
                value,
                NumberStyles.Any,
                CultureInfo.InvariantCulture,
                out double serial))
            {
                try
                {
                    return DateTime.FromOADate(serial);
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
    }
}