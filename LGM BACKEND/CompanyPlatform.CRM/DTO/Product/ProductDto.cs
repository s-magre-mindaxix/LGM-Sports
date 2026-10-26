using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace CompanyPlatform.CRM.DTO.Product
{
    public class ProductDto
    {
        public int ProductId { get; set; }

        [Required]
        [StringLength(50)]
        public string? ProductCode { get; set; }
        [Required]
        [StringLength(50)]
        public string? ProductSKU { get; set; }

        public string? PartNo { get; set; }

        [Required]
        public string ProductName { get; set; } = string.Empty;


        public int VendorId { get; set; }

        public IFormFile? ProductImageFile { get; set; }
        public string? ProductImagePath { get; set; }

        public string? ProductShortName { get; set; }
        public string? CompanyNameOfProduct { get; set; }

        public int? ProductGroupId { get; set; }
        public int? CategoryId { get; set; }
        public int? ProductTypeId { get; set; }
        //public int? VariantId { get; set; }
        public int? VersionId { get; set; }
        public int? CurrencyId { get; set; }
        public int? PartConditionId { get; set; }

        public string? ProductDescription { get; set; }
        public string? Specification { get; set; }

        public DateTime? ManufacturingDate { get; set; }
        public DateTime? ExpiryDate { get; set; }

        public string? WarrantyPeriod { get; set; }
        public string? HSNCode { get; set; }
        public string? UOM { get; set; }

        public string? HasAccessories { get; set; }
        public string? MapAccessories { get; set; }

        public decimal PurchasePrice { get; set; }
        public decimal SalePrice { get; set; }

        public string? TaxPreference { get; set; }
        public int? TaxRateId { get; set; }

        public int AvailableQuantity { get; set; }
        public int OutOfStockWarning { get; set; }

        public bool IsCalibration { get; set; }
        public string? CalibrationFrequency { get; set; }

        public string ProductSource { get; set; } = "Local";

        public decimal? BCD { get; set; }
        public decimal? SWS { get; set; }
        public decimal? IGST { get; set; }

        public string? VendorName { get; set; }
        public string? VendorCode { get; set; }

        public List<ProductCurrencyPriceDto> CurrencyPrices { get; set; } = new();

        public int? BrandId { get; set; }
        public int? UnitId { get; set; }
        public int? TaxId { get; set; }

        public decimal SellingPrice { get; set; }
        public decimal MRP { get; set; }

        public string? HSN { get; set; }

        public decimal MinStock { get; set; } = 0;
        public decimal ReorderLevel { get; set; } = 0;

        public bool TrackStock { get; set; } = true;
        public bool TrackSerial { get; set; } = false;
        public bool TrackBatch { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public string? CategoryName { get; set; }
        public string? BrandName { get; set; }
        public string? UnitName { get; set; }
        public string? TaxName { get; set; }
    }


    public class ProductFormDto : ProductDto
    {
        public string? CurrencyPricesJson { get; set; }
    }

    public class ProductCurrencyPriceDto
    {
        public int CurrencyId { get; set; }

        public decimal Price { get; set; }

        public string? CurrencyName { get; set; }

        public string? CurrencySymbol { get; set; }
    }

    public class ProductExcelDto
    {
        public string? Id { get; set; }
        public string? VendorId { get; set; }
        public string? ProductBrandCompanyName { get; set; }
        public string? GroupName { get; set; }
        public string? CategoryName { get; set; }
        public string? ProductCode { get; set; }
        public string? ProductType { get; set; }
        public string? ProductName { get; set; }
        public string? Variant { get; set; }
        public string? Version { get; set; }
        public string? ProductOwnerCompanyName { get; set; }
        public string? ProductShortName { get; set; }
        public string? CompanyNameOfProduct { get; set; }
        public string? ProductDescription { get; set; }
        public string? Specification { get; set; }
        public string? PartUnique { get; set; }
        public string? ProductImage { get; set; }
        public string? UnitOfMeasurement { get; set; }
        public DateTime? ManufacturingDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? WarrantyPeriod { get; set; }
        public string? Category { get; set; }
        public string? HSNCode { get; set; }
        public string? PartCondition { get; set; }
        public string? HaveAccessories { get; set; }
        public string? MapAccessories { get; set; }
        public decimal? PurchasePrice { get; set; }
        public decimal? SalePrice { get; set; }
        public string? Currency { get; set; }
        public string? TaxPreference { get; set; }
        public string? TaxRate { get; set; }
        public int? AvailableQuantity { get; set; }
        public int? OutOfStockWarning { get; set; }
        public int? StoreGroup { get; set; }
        public string? ResponsiblePerson { get; set; }
        public string? Designation { get; set; }
        public string? MobileNo { get; set; }
        public string? EmailId { get; set; }
        public string? StoreAddress { get; set; }
        public string? FlatNo { get; set; }
        public string? PremisesName { get; set; }
        public string? RoadLane { get; set; }
        public string? AreaLocality { get; set; }
        public string? TownDistrict { get; set; }
        public string? PinCode { get; set; }
        public string? Country { get; set; }
        public string? State { get; set; }
        public string? StoreMobileNo { get; set; }
        public string? StoreAltMobileNo { get; set; }
        public string? StoreEmailId { get; set; }
        public string? StoreAltEmailId { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? DeleteStatus { get; set; }
        public int? BrandId { get; set; }
        public int? UnitId { get; set; }
        public int? TaxId { get; set; }
        public decimal? SellingPrice { get; set; }
        public decimal? MRP { get; set; }
        public string? HSN { get; set; }
        public decimal? MinStock { get; set; }
        public decimal? ReorderLevel { get; set; }
        public bool? TrackStock { get; set; }
        public bool? TrackSerial { get; set; }
        public bool? TrackBatch { get; set; }
        public bool? IsActive { get; set; }
    }
}