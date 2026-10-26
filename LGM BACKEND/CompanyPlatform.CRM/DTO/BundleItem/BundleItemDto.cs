
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.BundleItem
{
    public class BundleItemDto
    {
        public int BundleItemId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int BundleId { get; set; }

        [Required]
        //[Range(1, int.MaxValue)]
        //public int ItemId { get; set; }

        //[Required]
        //[RegularExpression(
        //    "^(Product|Variant|Accessory)$",
        //    ErrorMessage = "ItemType must be Product, Variant, or Accessory.")]
        //public string ItemType { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; } = 1;

        [Range(1, int.MaxValue)]
        public int? AccessoriesId { get; set; }

        [Required]
        [StringLength(30)]
        public string PricingType { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]

        public decimal AllocatedPrice { get; set; }
        [Range(1, int.MaxValue)]
        public int? ProductId { get; set; }

        [Range(1, int.MaxValue)]
        public int? VariantId { get; set; }

        public bool IsOptional { get; set; } = false;

        public bool IsDeleted { get; set; } = false;
    }
}
