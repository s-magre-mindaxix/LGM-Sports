using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CompanyPlatform.Core.Models.Commonmaster;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("BundleItems")]
    public class BundleItem
    {
        [Key]
        public int BundleItemId { get; set; }

        [Required]
        public int BundleId { get; set; }

        public int? ProductId { get; set; }

        [ForeignKey(nameof(ProductId))]
        public virtual Product? Product { get; set; }

        public int? VariantId { get; set; }

        [ForeignKey(nameof(VariantId))]
        public virtual ProductVariant? Variant { get; set; }

        //public int? AccessoriesId { get; set; }

        //[ForeignKey(nameof(AccessoriesId))]
        //public virtual Accessories? Accessories { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; } = 1;

        [Required]
        [MaxLength(30)]
        public string PricingType { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal AllocatedPrice { get; set; }

        public bool IsOptional { get; set; } = false;

        public bool IsDeleted { get; set; } = false;

        public int? AccessoriesId { get; set; }

        [ForeignKey(nameof(AccessoriesId))]
        public virtual Accessories? Accessories { get; set; }
    }
}