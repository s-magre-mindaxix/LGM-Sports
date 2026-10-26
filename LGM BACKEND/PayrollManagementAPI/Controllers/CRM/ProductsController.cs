using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO.Product;
using CompanyPlatform.CRM.Services.Product;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;
using System.Text.Json;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _service;
        private readonly ApplicationDBContext _context;

        public ProductsController(
            IProductService service,
            ApplicationDBContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("generate-code")]
        public async Task<IActionResult> GeneratePartNumber(
            [FromQuery] int vendorId,
            [FromQuery] int typeCode,
            [FromQuery] int originCode)
        {
            if (vendorId <= 0 || typeCode < 0 || originCode < 0)
            {
                return BadRequest("Invalid part number parameters.");
            }

            try
            {
                string code = await _service.GeneratePartNumber(
                    vendorId,
                    typeCode,
                    originCode);

                return Ok(new { productCode = code });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _service.GetByIdAsync(id);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Product not found."
                });
            }

            return Ok(result);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Post(
            [FromForm] ProductFormDto form)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            try
            {
                var dto = MapToProductDto(form);

                int id = await _service.CreateAsync(dto);

                return Ok(new
                {
                    ProductId = id,
                    Message = "Product created successfully."
                });
            }
            catch (JsonException)
            {
                return BadRequest(new
                {
                    message =
                        "CurrencyPricesJson must contain a valid JSON array."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Put(
            int id,
            [FromForm] ProductFormDto form)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            try
            {
                var dto = MapToProductDto(form);
                dto.ProductId = id;

                bool updated = await _service.UpdateAsync(dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        message = "Product not found."
                    });
                }

                return Ok(new
                {
                    Message = "Product updated successfully."
                });
            }
            catch (JsonException)
            {
                return BadRequest(new
                {
                    message =
                        "CurrencyPricesJson must contain a valid JSON array."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private static ProductDto MapToProductDto(
            ProductFormDto form)
        {
            List<ProductCurrencyPriceDto> currencyPrices = new();

            if (!string.IsNullOrWhiteSpace(form.CurrencyPricesJson))
            {
                currencyPrices =
                    JsonSerializer.Deserialize<List<ProductCurrencyPriceDto>>(
                        form.CurrencyPricesJson,
                        new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        })
                    ?? new List<ProductCurrencyPriceDto>();
            }

            return new ProductDto
            {
                ProductId = form.ProductId,
                ProductCode = form.ProductCode,
                ProductSKU = form.ProductSKU,
                PartNo = form.PartNo,
                ProductName = form.ProductName,
                VendorId = form.VendorId,

                ProductImageFile = form.ProductImageFile,
                ProductImagePath = form.ProductImagePath,

                ProductShortName = form.ProductShortName,
                CompanyNameOfProduct = form.CompanyNameOfProduct,

                ProductGroupId = form.ProductGroupId,
                CategoryId = form.CategoryId,
                ProductTypeId = form.ProductTypeId,

                // VariantId removed.
                VersionId = form.VersionId,
                CurrencyId = form.CurrencyId,
                PartConditionId = form.PartConditionId,

                ProductDescription = form.ProductDescription,
                Specification = form.Specification,
                ManufacturingDate = form.ManufacturingDate,
                ExpiryDate = form.ExpiryDate,
                WarrantyPeriod = form.WarrantyPeriod,
                HSNCode = form.HSNCode,
                UOM = form.UOM,
                HasAccessories = form.HasAccessories,
                MapAccessories = form.MapAccessories,

                PurchasePrice = form.PurchasePrice,
                SalePrice = form.SalePrice,

                TaxPreference = form.TaxPreference,
                TaxRateId = form.TaxRateId,

                AvailableQuantity = form.AvailableQuantity,
                OutOfStockWarning = form.OutOfStockWarning,

                IsCalibration = form.IsCalibration,
                CalibrationFrequency = form.CalibrationFrequency,
                ProductSource = form.ProductSource,

                BCD = form.BCD,
                SWS = form.SWS,
                IGST = form.IGST,

                VendorName = form.VendorName,
                VendorCode = form.VendorCode,

                CurrencyPrices = currencyPrices,

                BrandId = form.BrandId,
                UnitId = form.UnitId,
                TaxId = form.TaxId,

                SellingPrice = form.SellingPrice,
                MRP = form.MRP,
                HSN = form.HSN,

                MinStock = form.MinStock,
                ReorderLevel = form.ReorderLevel,

                TrackStock = form.TrackStock,
                TrackSerial = form.TrackSerial,
                TrackBatch = form.TrackBatch,
                IsActive = form.IsActive,

                CategoryName = form.CategoryName,
                BrandName = form.BrandName,
                UnitName = form.UnitName,
                TaxName = form.TaxName
            };
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            bool deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Product not found."
                });
            }

            return Ok(new
            {
                Message = "Product deleted successfully."
            });
        }

        [HttpPost("upload-excel")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadExcel(
            [FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Please upload an Excel file.");
            }

            try
            {
                await _service.ImportProductsAsync(file);

                return Ok(new
                {
                    Message = "Products imported successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("export-excel")]
        public async Task<IActionResult> ExportExcel()
        {
            var products = await _context.Tbl_Products
                .AsNoTracking()
                .Include(p => p.ProductGroup)
                .Include(p => p.Category)
                .Include(p => p.ProductType)
                // Variant Include removed.
                .Include(p => p.Version)
                .Include(p => p.Currency)
                .Include(p => p.PartCondition)
                .Include(p => p.Vendor)
                .Include(p => p.Brand)
                .Include(p => p.Unit)
                .Include(p => p.Tax)
                .OrderBy(p => p.ProductId)
                .ToListAsync();

            var accessoriesList = await _context.Tbl_Accessories
                .AsNoTracking()
                .Where(a => !a.IsDeleted)
                .ToListAsync();

            ExcelPackage.License.SetNonCommercialOrganization(
                "CompanyPlatform");

            using var package = new ExcelPackage();

            var worksheet =
                package.Workbook.Worksheets.Add("Products");

            string[] headers =
            {
                "ID",
                "VendorId",
                "Vendor Name",
                "Product Group",
                "Category",
                "ProductCode",
                "ProductSKU",
                "PartNo",
                "ProductType",
                "Version",
                "ProductName",
                "ProductShortName",
                "CompanyNameOfProduct",
                "ProductDescription",
                "Specification",
                "UOM",
                "ManufacturingDate",
                "ExpiryDate",
                "WarrantyPeriod",
                "HSNCode",
                "PartCondition",
                "HasAccessories",
                "MapAccessories",
                "PurchasePrice",
                "SalePrice",
                "Currency",
                "TaxPreference",
                "TaxRateId",
                "IsCalibration",
                "CalibrationFrequency",
                "ProductSource",
                "BCD",
                "IGST",
                "SWS",
                "AvailableQuantity",
                "OutOfStockWarning",
                "IsDeleted",
                "BrandId",
                "UnitId",
                "TaxId",
                "SellingPrice",
                "MRP",
                "MinStock",
                "ReorderLevel",
                "TrackStock",
                "TrackSerial",
                "TrackBatch",
                "IsActive"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
            }

            using (var headerRange =
                worksheet.Cells[1, 1, 1, headers.Length])
            {
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Font.Color.SetColor(Color.White);
                headerRange.Style.Fill.PatternType =
                    ExcelFillStyle.Solid;
                headerRange.Style.Fill.BackgroundColor.SetColor(
                    Color.DarkBlue);
                headerRange.Style.HorizontalAlignment =
                    ExcelHorizontalAlignment.Center;
            }

            int row = 2;

            foreach (var product in products)
            {
                int col = 1;

                worksheet.Cells[row, col++].Value = product.ProductId;
                worksheet.Cells[row, col++].Value = product.VendorId;
                worksheet.Cells[row, col++].Value =
                    product.Vendor?.VendorName ?? "";
                worksheet.Cells[row, col++].Value =
                    product.ProductGroup?.GroupName ?? "";
                worksheet.Cells[row, col++].Value =
                    product.Category?.CategoryName ?? "";
                worksheet.Cells[row, col++].Value = product.ProductCode;
                worksheet.Cells[row, col++].Value = product.ProductSKU;
                worksheet.Cells[row, col++].Value = product.PartNo;
                worksheet.Cells[row, col++].Value =
                    product.ProductType?.ProductTypeName ?? "";

                // Variant column and mapping removed.

                worksheet.Cells[row, col++].Value =
                    product.Version?.VersionName ?? "";
                worksheet.Cells[row, col++].Value = product.ProductName;
                worksheet.Cells[row, col++].Value =
                    product.ProductShortName;
                worksheet.Cells[row, col++].Value =
                    product.CompanyNameOfProduct;
                worksheet.Cells[row, col++].Value =
                    product.ProductDescription;
                worksheet.Cells[row, col++].Value = product.Specification;
                worksheet.Cells[row, col++].Value = product.UOM;

                worksheet.Cells[row, col].Value =
                    product.ManufacturingDate;
                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "yyyy-mm-dd";

                worksheet.Cells[row, col].Value = product.ExpiryDate;
                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "yyyy-mm-dd";

                worksheet.Cells[row, col++].Value =
                    product.WarrantyPeriod;
                worksheet.Cells[row, col++].Value = product.HSNCode;
                worksheet.Cells[row, col++].Value =
                    product.PartCondition?.PartConditionName ?? "";
                worksheet.Cells[row, col++].Value =
                    product.HasAccessories;

                string accessoryCodes = "";

                if (!string.IsNullOrWhiteSpace(product.MapAccessories))
                {
                    var ids = product.MapAccessories
                        .Split(
                            ',',
                            StringSplitOptions.RemoveEmptyEntries)
                        .Select(x => x.Trim())
                        .ToHashSet();

                    accessoryCodes = string.Join(",",
                        accessoriesList
                            .Where(a => ids.Contains(
                                a.AccessoriesId.ToString()))
                            .Select(a => a.AccessoriesCode));
                }

                worksheet.Cells[row, col++].Value = accessoryCodes;

                worksheet.Cells[row, col].Value =
                    product.PurchasePrice;
                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "#,##0.00";

                worksheet.Cells[row, col].Value = product.SalePrice;
                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "#,##0.00";

                worksheet.Cells[row, col++].Value =
                    product.Currency?.CurrencySymbol
                    ?? product.Currency?.CurrencyName
                    ?? "";

                worksheet.Cells[row, col++].Value =
                    product.TaxPreference;
                worksheet.Cells[row, col++].Value = product.TaxRateId;
                worksheet.Cells[row, col++].Value =
                    product.IsCalibration ? "Yes" : "No";
                worksheet.Cells[row, col++].Value =
                    product.CalibrationFrequency;
                worksheet.Cells[row, col++].Value =
                    product.ProductSource;

                worksheet.Cells[row, col].Value = product.BCD;
                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "#,##0.00";

                worksheet.Cells[row, col].Value = product.IGST;
                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "#,##0.00";

                worksheet.Cells[row, col].Value = product.SWS;
                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "#,##0.00";

                worksheet.Cells[row, col++].Value =
                    product.AvailableQuantity;
                worksheet.Cells[row, col++].Value =
                    product.OutOfStockWarning;
                worksheet.Cells[row, col++].Value =
                    product.IsDeleted ? 1 : 0;

                worksheet.Cells[row, col++].Value = product.BrandId;
                worksheet.Cells[row, col++].Value = product.UnitId;
                worksheet.Cells[row, col++].Value = product.TaxId;
                worksheet.Cells[row, col++].Value = product.SalePrice;
                worksheet.Cells[row, col++].Value = product.MRP;
                worksheet.Cells[row, col++].Value = product.MinStock;
                worksheet.Cells[row, col++].Value =
                    product.ReorderLevel;
                worksheet.Cells[row, col++].Value = product.TrackStock;
                worksheet.Cells[row, col++].Value = product.TrackSerial;
                worksheet.Cells[row, col++].Value = product.TrackBatch;
                worksheet.Cells[row, col++].Value = product.IsActive;

                row++;
            }

            if (worksheet.Dimension != null)
            {
                worksheet.Cells[
                    worksheet.Dimension.Address].AutoFitColumns();

                worksheet.Cells[
                    1, 1, worksheet.Dimension.End.Row, headers.Length]
                    .AutoFilter = true;

                worksheet.View.FreezePanes(2, 1);
            }

            byte[] fileContents =
                await package.GetAsByteArrayAsync();

            string fileName =
                $"Products_{DateTime.Now:yyyyMMddHHmmss}.xlsx";

            const string contentType =
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            return File(fileContents, contentType, fileName);
        }
    }
}