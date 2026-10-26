
using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.ProductAccessoryPrice
{
    public class ProductAccessoryPriceDto
    {
        public int Id { get; set; }

        [Required]
        public int PriceListId { get; set; }

        [Required]
        public int ItemId { get; set; }

        [Required]
        [RegularExpression("^(Product|Accessory)$",
            ErrorMessage = "ItemType must be Product or Accessory.")]
        public string ItemType { get; set; } = string.Empty;

        [Required]
        [StringLength(30)]
        public string PriceType { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }

        [Range(1, int.MaxValue)]
        public int MinQty { get; set; } = 1;

        public DateTime EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }
    }
}
