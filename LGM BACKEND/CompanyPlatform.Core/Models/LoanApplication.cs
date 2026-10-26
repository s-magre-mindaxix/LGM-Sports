using CompanyPlatform.Core.Models.CRM.Employee;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    public class LoanApplication
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }

        [Required] 
        public int LoanTypeID { get; set; }

        [ForeignKey("LoanTypeID")] 
        public virtual LoanMaster LoanType { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal LoanAmount { get; set; }

        [Required]
        public int TenureInMonths { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal MonthlyDeduction { get; set; }

        [Required]
        public DateTime ApplicationDate { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } 

        public int? ApprovedByUserID { get; set; }
        [ForeignKey("ApprovedByUserID")]
        public virtual Employees ApprovedByUser { get; set; }
    }
}
