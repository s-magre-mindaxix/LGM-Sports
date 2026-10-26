
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.Inventory
{
    [Table("Tax")]
    public class Tax
    {
        [Key]
        public int TaxId { get; set; }

        [Required]
        [StringLength(50)]
        public string TaxCode { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string TaxName { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
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
