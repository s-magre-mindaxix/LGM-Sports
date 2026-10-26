using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_ProfessionalTaxSlab")]
    public class ProfessionalTaxSlab
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string State { get; set; } // e.g., "Maharashtra", "Karnataka"

        [Required]
        [StringLength(20)]
        public string Gender { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal MinGrossSalary { get; set; } // The lower bound of the monthly gross salary range

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? MaxGrossSalary { get; set; } // The upper bound. Nullable for the highest slab.

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal TaxAmount { get; set; } // The monthly tax amount for this slab

        public bool IsDeleted { get; set; } = false;
    }
}
