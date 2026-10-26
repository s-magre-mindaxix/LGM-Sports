using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.ProductBarcode
{
    public class ProductBarcodeDto
    {
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
    }
}