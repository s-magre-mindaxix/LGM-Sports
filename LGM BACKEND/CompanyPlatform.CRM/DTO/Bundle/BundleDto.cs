
using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Bundle
{
    public class BundleDto
    {
        public int BundleId { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue)]
        public int ParentProductId { get; set; }

        [Range(0, double.MaxValue)]
        public decimal PackagePrice { get; set; }

        [Required]
        [StringLength(30)]
        public string TaxMode { get; set; } = string.Empty;

        public DateTime EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}
