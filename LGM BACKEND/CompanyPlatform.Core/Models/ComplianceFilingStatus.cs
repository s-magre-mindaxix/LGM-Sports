using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.Models
{
    public enum FilingStatus
    {
        Pending,
        Filed,
        Due
    }

    [Table("tbl_ComplianceFilingStatus")]
    public class ComplianceFilingStatus
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string ComplianceType { get; set; } // e.g., "PF ECR Filing", "ESIC Returns"

        [Required]
        public int Year { get; set; }

        [Required]
        public int Month { get; set; }

        [Required]
        public FilingStatus Status { get; set; }

        public DateTime? DueDate { get; set; }

        public DateTime? FiledDate { get; set; }

        [StringLength(100)]
        public string? TransactionId { get; set; } 

        [StringLength(500)]
        public string? Notes { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
