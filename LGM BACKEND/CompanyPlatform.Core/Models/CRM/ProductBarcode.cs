using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CompanyPlatform.Core.Models.CRM;

namespace CompanyPlatform.Core.Models.Commonmaster
{
    [Table("ProductBarcode")]
    public class ProductBarcode
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Barcode { get; set; } = string.Empty;

        [Required]
        [StringLength(30)]
        public string BarcodeType { get; set; } = string.Empty;

        public int? ProductId { get; set; }

        public int? VariantId { get; set; }

        public int? AccessoryId { get; set; }

        public bool IsPrimary { get; set; } = false;

        public bool Active { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        [ForeignKey(nameof(ProductId))]
        public Product? Product { get; set; }

        [ForeignKey(nameof(VariantId))]
        public ProductVariant? Variant { get; set; }

        [ForeignKey(nameof(AccessoryId))]
        public Accessories? Accessory { get; set; }
    }
}