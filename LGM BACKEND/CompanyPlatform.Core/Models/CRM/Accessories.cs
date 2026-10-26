using CompanyPlatform.Core.Models.Commonmaster;
using CompanyPlatform.Core.Models.CRM.Dashboards;
using CompanyPlatform.Core.Models.Inventory;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    public class Accessories
    {
        [Key]
        public int AccessoriesId { get; set; }

        [Required]
        [StringLength(50)]
        public string AccessoriesCode { get; set; } = string.Empty;
        [StringLength(50)]
        public string? AccessorySKU { get; set; }

        [Required]
        [StringLength(150)]
        public string AccessoriesName { get; set; } = string.Empty;

        // Existing image path or URL stored in the database
        public string? AccessoriesImage { get; set; }

        // Used to receive an uploaded image file
        [NotMapped]
        public IFormFile? AccessoriesImageFile { get; set; }

        public string? AccessoriesShortName { get; set; }

        public string? CompanyNameOfProduct { get; set; }

        public int? VendorId { get; set; }

        [ForeignKey(nameof(VendorId))]
        public virtual Vendor? Vendor { get; set; }

        public int? ProductGroupId { get; set; }

        [ForeignKey(nameof(ProductGroupId))]
        public virtual ProductGroup? ProductGroup { get; set; }

        public int? CategoryId { get; set; }

        [ForeignKey(nameof(CategoryId))]
        public virtual Category? Category { get; set; }

        public int? BrandId { get; set; }

        [ForeignKey(nameof(BrandId))]
        public virtual Brand? Brand { get; set; }

        public int? UnitId { get; set; }

        [ForeignKey(nameof(UnitId))]
        public virtual Unit? Unit { get; set; }

        public int? TaxId { get; set; }

        [ForeignKey(nameof(TaxId))]
        public virtual Tax? Tax { get; set; }

        public int? ProductTypeId { get; set; }

        [ForeignKey(nameof(ProductTypeId))]
        public virtual ProductType? ProductType { get; set; }

        //public int? VariantId { get; set; }

        //[ForeignKey(nameof(VariantId))]
        //public virtual ProductVariant? Variant { get; set; }

        public int? VersionId { get; set; }

        [ForeignKey(nameof(VersionId))]
        public virtual ProductVersion? Version { get; set; }

        public int? CurrencyId { get; set; }

        [ForeignKey(nameof(CurrencyId))]
        public virtual Currency? Currency { get; set; }

        public int? PartConditionId { get; set; }

        [ForeignKey(nameof(PartConditionId))]
        public virtual PartCondition? PartCondition { get; set; }

        public string? AccessoriesDescription { get; set; }

        public string? Specification { get; set; }

        public string? PartUnique { get; set; }

        public string? PartNo { get; set; }

        public DateTime? ManufacturingDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public string? WarrantyPeriod { get; set; }

        public string? HSNCode { get; set; }

        public string? UOM { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PurchasePrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SalePrice { get; set; }

        public string? TaxPreference { get; set; }

        public int? TaxRateId { get; set; }

        public int AvailableQuantity { get; set; }

        public int OutOfStockWarning { get; set; }

        public int MinStock { get; set; }

        public bool TrackStock { get; set; } = true;

        public string ProductSource { get; set; } = "Local";

        public decimal? BCD { get; set; }

        public decimal? SWS { get; set; }

        public decimal? IGST { get; set; }

        public bool IsCalibration { get; set; } = false;

        public string? CalibrationFrequency { get; set; }

        public virtual ICollection<AccessoryCurrencyPrice> CurrencyPrices
        {
            get;
            set;
        } = new List<AccessoryCurrencyPrice>();

        public bool Active { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}