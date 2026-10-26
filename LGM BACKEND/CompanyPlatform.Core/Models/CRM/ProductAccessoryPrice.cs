
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("ProductAccessoryPrices")]
    public class ProductAccessoryPrice
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PriceListId { get; set; }

        [Required]
        public int ItemId { get; set; }

        [Required]
        [MaxLength(30)]
        public string ItemType { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string PriceType { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Range(1, int.MaxValue)]
        public int MinQty { get; set; } = 1;

        public DateTime EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }
    }
}
