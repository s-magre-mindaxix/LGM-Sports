
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTOs.Inventory
{
    public class TaxDto
    {
        public int TaxId { get; set; }

        [Required]
        [StringLength(50)]
        public string TaxCode { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string TaxName { get; set; } = string.Empty;

        [Range(0, 100)]
        public decimal Rate { get; set; }

        [Required]
        [StringLength(50)]
        public string TaxType { get; set; } = string.Empty;

        public DateTime EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}
