
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("AccessoryPrices")]
    public class AccessoryPrice
    {
        [Key]
        public int AccessoryPriceId { get; set; }

        [Required]
        public int PriceListId { get; set; }

        [ForeignKey(nameof(PriceListId))]
        public virtual PriceList PriceList { get; set; } = null!;

        [Required]
        public int AccessoriesId { get; set; }

        [ForeignKey(nameof(AccessoriesId))]
        public virtual Accessories Accessory { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string PriceType { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        public int MinQty { get; set; } = 1;

        [Required]
        public DateTime EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}
