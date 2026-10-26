
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("ProductAccessoryRule")]
    public class ProductAccessoryRule
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [ForeignKey(nameof(ProductId))]
        public virtual Product? Product { get; set; }

        [Required]
        public int AccessoriesId { get; set; }

        [ForeignKey(nameof(AccessoriesId))]
        public virtual Accessories? Accessory { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; } = 1;

        [Required]
        [StringLength(20)]
        public string MandatoryOptional { get; set; } = "Optional";

        [Required]
        [StringLength(30)]
        public string PricingType { get; set; } = "Default";

        [Column(TypeName = "decimal(18,2)")]
        public decimal DefaultPrice { get; set; }

        public DateTime EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }

        public bool Active { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}
