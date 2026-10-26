using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_TaxSlabs")]
    public class TaxSlab
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(10)]
        public string FinancialYear { get; set; } // "2023-2024"

        [Required]
        [StringLength(20)]
        public string TaxRegime { get; set; } // "Old", "New"

        // To support different rules for senior citizens in the future
        [Required]
        [StringLength(20)]
        public string CitizenType { get; set; } = "Regular"; // "Regular", "Senior", "SuperSenior"

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal FromAmount { get; set; }

        // Nullable to represent the final "above X" slab
        [Column(TypeName = "decimal(18, 2)")]
        public decimal? ToAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(5, 2)")]
        public decimal RatePercentage { get; set; }

    }
}
