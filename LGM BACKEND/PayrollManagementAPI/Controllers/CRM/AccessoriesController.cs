using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO.Accessories;
using CompanyPlatform.CRM.Services.Accessories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollManagementAPI.Controllers.CRM
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccessoriesController : ControllerBase
    {
        private readonly IAccessoriesService _service;
        private readonly ApplicationDBContext _context;

        public AccessoriesController(
            IAccessoriesService service,
            ApplicationDBContext context)
        {
            _service = service;
            _context = context;
        }

        // GET: api/Accessories
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return Ok(await _service.GetAllAsync());
        }

        // GET: api/Accessories/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var accessory = await _service.GetByIdAsync(id);
            return Ok(accessory);
        }

        // GET: api/Accessories/generate-code?vendorId=1&source=Local
        [HttpGet("generate-code")]
        public async Task<IActionResult> GenerateCode(
            [FromQuery] int vendorId,
            [FromQuery] string source)
        {
            if (vendorId <= 0)
                return BadRequest("A valid vendorId is required.");

            if (string.IsNullOrWhiteSpace(source))
                return BadRequest("Product source is required.");

            var code = await _service.GenerateAccessoryCode(
                vendorId,
                source);

            return Ok(new { AccessoriesCode = code });
        }

        // POST: api/Accessories
        // Accepts multipart/form-data, including an optional image.
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Post(
            [FromForm] AccessoriesDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var id = await _service.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(Get),
                    new { id },
                    new
                    {
                        AccessoriesId = id,
                        Message = "Accessory created successfully."
                    });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        // PUT: api/Accessories/1
        // Accepts multipart/form-data, including an optional image.
        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Put(
            int id,
            [FromForm] AccessoriesDto dto)
        {
            if (id <= 0)
                return BadRequest("Invalid accessory ID.");

            if (id != dto.AccessoriesId && dto.AccessoriesId != 0)
                return BadRequest(
                    "Route ID and AccessoriesId do not match.");

            dto.AccessoriesId = id;

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateAsync(dto);

                if (!updated)
                    return NotFound(new
                    {
                        Message = "Accessory not found."
                    });

                return Ok(new
                {
                    Message = "Accessory updated successfully."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET: api/Accessories/1/logs
        [HttpGet("{id:int}/logs")]
        public async Task<IActionResult> GetAccessoryLogs(int id)
        {
            var logs = await _service.GetLogsAsync(id);
            return Ok(logs);
        }

        // DELETE: api/Accessories/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (id <= 0)
                return BadRequest("Invalid accessory ID.");

            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
                return NotFound(new
                {
                    Message = "Accessory not found."
                });

            return Ok(new
            {
                Message = "Accessory deleted successfully."
            });
        }

        // POST: api/Accessories/upload-excel
        [HttpPost("upload-excel")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadExcel(
            [FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(
                    "Please upload a valid Excel file.");

            var extension = System.IO.Path.GetExtension(file.FileName);

            if (!string.Equals(
                extension,
                ".xlsx",
                StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(
                    "Only .xlsx files are supported.");
            }

            await _service.ImportAccessoriesAsync(file);

            return Ok(new
            {
                Message = "Accessories imported successfully."
            });
        }

        // GET: api/Accessories/export-excel
        [HttpGet("export-excel")]
        public async Task<IActionResult> ExportExcel()
        {
            var accessories = await _context.Tbl_Accessories
                .AsNoTracking()
                .Include(a => a.Vendor)
                .Include(a => a.ProductGroup)
                .Include(a => a.Category)
                .Include(a => a.Brand)
                .Include(a => a.Unit)
                .Include(a => a.Tax)
                .Include(a => a.ProductType)
                //.Include(a => a.Variant)
                .Include(a => a.Version)
                .Include(a => a.Currency)
                .Include(a => a.PartCondition)
                .OrderBy(a => a.AccessoriesId)
                .ToListAsync();

            ExcelPackage.License.SetNonCommercialOrganization(
                "CompanyPlatform");

            using var package = new ExcelPackage();

            var worksheet = package.Workbook.Worksheets.Add(
                "Accessories");

            string[] headers =
            {
                "AccessoriesId",
                "VendorId",
                "VendorName",
                "AccessoriesCode",
                "AccessorySKU",
                "PartNo",
                "AccessoriesName",
                "AccessoriesImage",
                "AccessoriesShortName",
                "CompanyNameOfProduct",
                "ProductGroupId",
                "ProductGroupName",
                "CategoryId",
                "CategoryName",
                "BrandId",
                "BrandName",
                "UnitId",
                "UnitName",
                "TaxId",
                "ProductTypeId",
                "ProductTypeName",
                "VariantId",
                "VariantName",
                "VersionId",
                "VersionName",
                "CurrencyId",
                "CurrencyName",
                "PartConditionId",
                "PartConditionName",
                "AccessoriesDescription",
                "Specification",
                "PartUnique",
                "ManufacturingDate",
                "ExpiryDate",
                "WarrantyPeriod",
                "HSNCode",
                "UOM",
                "PurchasePrice",
                "SalePrice",
                "TaxPreference",
                "TaxRateId",
                "AvailableQuantity",
                "OutOfStockWarning",
                "MinStock",
                "TrackStock",
                "Active",
                "IsDeleted",
                "BCD",
                "SWS",
                "IGST",
                "IsCalibration",
                "CalibrationFrequency",
                "ProductSource"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
            }

            int row = 2;

            foreach (var accessory in accessories)
            {
                int col = 1;

                worksheet.Cells[row, col++].Value =
                    accessory.AccessoriesId;

                worksheet.Cells[row, col++].Value =
                    accessory.VendorId;

                worksheet.Cells[row, col++].Value =
                    accessory.Vendor?.VendorName ?? string.Empty;

                worksheet.Cells[row, col++].Value =
                    accessory.AccessoriesCode;

                worksheet.Cells[row, col++].Value =
                    accessory.AccessorySKU;

                worksheet.Cells[row, col++].Value =
                    accessory.PartNo;

                worksheet.Cells[row, col++].Value =
                    accessory.AccessoriesName;

                worksheet.Cells[row, col++].Value =
                    accessory.AccessoriesImage ?? string.Empty;

                worksheet.Cells[row, col++].Value =
                    accessory.AccessoriesShortName;

                worksheet.Cells[row, col++].Value =
                    accessory.CompanyNameOfProduct;

                worksheet.Cells[row, col++].Value =
                    accessory.ProductGroupId;

                worksheet.Cells[row, col++].Value =
                    accessory.ProductGroup?.GroupName ?? string.Empty;

                worksheet.Cells[row, col++].Value =
                    accessory.CategoryId;

                worksheet.Cells[row, col++].Value =
                    accessory.Category?.CategoryName ?? string.Empty;

                worksheet.Cells[row, col++].Value =
                    accessory.BrandId;

                worksheet.Cells[row, col++].Value =
                    accessory.Brand?.BrandName ?? string.Empty;

                worksheet.Cells[row, col++].Value =
                    accessory.UnitId;

                worksheet.Cells[row, col++].Value =
                    accessory.Unit?.UnitName ?? string.Empty;

                worksheet.Cells[row, col++].Value =
                    accessory.TaxId;

                worksheet.Cells[row, col++].Value =
                    accessory.ProductTypeId;

                worksheet.Cells[row, col++].Value =
                    accessory.ProductType?.ProductTypeName
                    ?? string.Empty;

                //worksheet.Cells[row, col++].Value =
                //    accessory.VariantId;

                //worksheet.Cells[row, col++].Value =
                //    accessory.Variant?.VariantName ?? string.Empty;

                worksheet.Cells[row, col++].Value =
                    accessory.VersionId;

                worksheet.Cells[row, col++].Value =
                    accessory.Version?.VersionName ?? string.Empty;

                worksheet.Cells[row, col++].Value =
                    accessory.CurrencyId;

                worksheet.Cells[row, col++].Value =
                    accessory.Currency?.CurrencySymbol
                    ?? accessory.Currency?.CurrencyName
                    ?? string.Empty;

                worksheet.Cells[row, col++].Value =
                    accessory.PartConditionId;

                worksheet.Cells[row, col++].Value =
                    accessory.PartCondition?.PartConditionName
                    ?? string.Empty;

                worksheet.Cells[row, col++].Value =
                    accessory.AccessoriesDescription;

                worksheet.Cells[row, col++].Value =
                    accessory.Specification;

                worksheet.Cells[row, col++].Value =
                    accessory.PartUnique;

                worksheet.Cells[row, col].Value =
                    accessory.ManufacturingDate;

                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "yyyy-mm-dd";

                worksheet.Cells[row, col].Value =
                    accessory.ExpiryDate;

                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "yyyy-mm-dd";

                worksheet.Cells[row, col++].Value =
                    accessory.WarrantyPeriod;

                worksheet.Cells[row, col++].Value =
                    accessory.HSNCode;

                worksheet.Cells[row, col++].Value =
                    accessory.UOM;

                worksheet.Cells[row, col].Value =
                    accessory.PurchasePrice;

                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "#,##0.00";

                worksheet.Cells[row, col].Value =
                    accessory.SalePrice;

                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "#,##0.00";

                worksheet.Cells[row, col++].Value =
                    accessory.TaxPreference;

                worksheet.Cells[row, col++].Value =
                    accessory.TaxRateId;

                worksheet.Cells[row, col++].Value =
                    accessory.AvailableQuantity;

                worksheet.Cells[row, col++].Value =
                    accessory.OutOfStockWarning;

                worksheet.Cells[row, col++].Value =
                    accessory.MinStock;

                worksheet.Cells[row, col++].Value =
                    accessory.TrackStock;

                worksheet.Cells[row, col++].Value =
                    accessory.Active;

                worksheet.Cells[row, col++].Value =
                    accessory.IsDeleted;

                worksheet.Cells[row, col].Value =
                    accessory.BCD;

                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "#,##0.00";

                worksheet.Cells[row, col].Value =
                    accessory.SWS;

                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "#,##0.00";

                worksheet.Cells[row, col].Value =
                    accessory.IGST;

                worksheet.Cells[row, col++].Style.Numberformat.Format =
                    "#,##0.00";

                worksheet.Cells[row, col++].Value =
                    accessory.IsCalibration;

                worksheet.Cells[row, col++].Value =
                    accessory.CalibrationFrequency;

                worksheet.Cells[row, col++].Value =
                    accessory.ProductSource;

                row++;
            }

            using (var range = worksheet.Cells[
                1, 1, 1, headers.Length])
            {
                range.Style.Font.Bold = true;

                range.Style.Fill.PatternType =
                    OfficeOpenXml.Style.ExcelFillStyle.Solid;

                range.Style.Fill.BackgroundColor.SetColor(
                    System.Drawing.Color.DarkBlue);

                range.Style.Font.Color.SetColor(
                    System.Drawing.Color.White);

                range.Style.HorizontalAlignment =
                    OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            }

            if (worksheet.Dimension != null)
            {
                worksheet.Cells[
                    worksheet.Dimension.Address].AutoFitColumns();

                worksheet.View.FreezePanes(2, 1);

                worksheet.Cells[
                    1, 1, 1, headers.Length].AutoFilter = true;
            }

            byte[] fileContents =
                await package.GetAsByteArrayAsync();

            if (fileContents.Length == 0)
                return NotFound(
                    "No Excel data could be generated.");

            Response.Headers["Cache-Control"] =
                "no-cache, no-store, must-revalidate";

            Response.Headers["Pragma"] = "no-cache";
            Response.Headers["Expires"] = "0";

            string fileName =
                $"Accessories_{DateTime.Now:yyyyMMddHHmmss}.xlsx";

            const string contentType =
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

            return File(fileContents, contentType, fileName);
        }
    }
}