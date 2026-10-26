using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace CompanyPlatform.CRM.DTO.Accessories
{
    public class AccessoriesDto
    {
        public int AccessoriesId { get; set; }
        public string? AccessoriesCode { get; set; }
        public string? AccessorySKU { get; set; }
        public string? AccessoriesName { get; set; }
        public string? PartNo { get; set; }

        // Image Upload
        public IFormFile? AccessoriesImageFile { get; set; }

        // Existing image path or URL
        public string? AccessoriesImage { get; set; }

        public string? AccessoriesShortName { get; set; }
        public string? CompanyNameOfProduct { get; set; }

        // Vendor
        public int? VendorId { get; set; }
        public string? VendorName { get; set; }
        public string? VendorCode { get; set; }

        // Product Group
        public int? ProductGroupId { get; set; }

        // Master Relationships
        public int? CategoryId { get; set; }
        public int? BrandId { get; set; }
        public int? UnitId { get; set; }
        public int? TaxId { get; set; }

        // Existing Relationships
        public int? ProductTypeId { get; set; }
        //public int? VariantId { get; set; }
        public int? VersionId { get; set; }
        public int? CurrencyId { get; set; }
        public int? PartConditionId { get; set; }

        // Description
        public string? AccessoriesDescription { get; set; }
        public string? Specification { get; set; }
        public string? PartUnique { get; set; }

        // Dates and Warranty
        public DateTime? ManufacturingDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? WarrantyPeriod { get; set; }

        // Product and Tax Details
        public string? HSNCode { get; set; }
        public string? UOM { get; set; }
        public string? TaxPreference { get; set; }
        public int? TaxRateId { get; set; }

        // Pricing
        public decimal PurchasePrice { get; set; }
        public decimal SalePrice { get; set; }

        // Stock
        public int AvailableQuantity { get; set; }
        public int OutOfStockWarning { get; set; }
        public int MinStock { get; set; }
        public bool TrackStock { get; set; } = true;

        // Status
        public bool Active { get; set; } = true;

        // Product Details
        public string ProductSource { get; set; } = "Local";
        public decimal? BCD { get; set; }
        public decimal? SWS { get; set; }
        public decimal? IGST { get; set; }

        // Calibration
        public bool IsCalibration { get; set; }
        public string? CalibrationFrequency { get; set; }

        // Currency Prices
        public List<AccessoryCurrencyPriceDto> CurrencyPrices { get; set; } = new();
    }

    public class AccessoryCurrencyPriceDto
    {
        public int CurrencyId { get; set; }
        public decimal Price { get; set; }
        public string? CurrencyName { get; set; }
        public string? CurrencySymbol { get; set; }
    }
}