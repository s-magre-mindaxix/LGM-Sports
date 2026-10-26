
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Bundles")]
    public class Bundle
    {
        [Key]
        public int BundleId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public int ParentProductId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PackagePrice { get; set; }

        [Required]
        [MaxLength(30)]
        public string TaxMode { get; set; } = string.Empty;

        public DateTime EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}
