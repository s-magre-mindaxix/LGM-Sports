using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using CompanyPlatform.Core.Models.CRM.Employee;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_Form16Status")]
    public class Form16Status
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }

        [Required]
        [StringLength(10)]
        public string FinancialYear { get; set; } // e.g., "2024-2025"

        [Required]
        [StringLength(20)]
        public string PartAStatus { get; set; } = "Pending"; // "Pending", "Uploaded"

        [Required]
        [StringLength(20)]
        public string PartBStatus { get; set; } = "Pending"; // "Pending", "Generated"

        [Required]
        [StringLength(20)]
        public string FinalStatus { get; set; } = "Pending"; // "Pending", "Published"

        [StringLength(50)]
        public string? CertificateNo { get; set; }

        public string? PartAFilePath { get; set; }

        public string? GeneratedFormFilePath { get; set; }

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
