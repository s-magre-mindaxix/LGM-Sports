using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CompanyPlatform.Core.Models.CRM.Employee;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_Advance")]
    public class Advance
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public Employees Employee { get; set; }

        [Required]
        [Precision(18, 2)]
        public decimal Amount { get; set; }

        [Required]
        public DateTime RequestDate { get; set; }

        [MaxLength(500)]
        public string Reason { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } 

        public int? ProcessedByEmployeeId { get; set; }
        [ForeignKey("ProcessedByEmployeeId")]
        public Employees ProcessedByEmployee { get; set; }

        public DateTime? StatusDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}