
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using CompanyPlatform.Core.Models.CRM.Employee;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.HRMS
{
    [Table("tbl_LeaveEncashment")]
    public class LeaveEncashment
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }

        [Required]
        public int FinancialYear { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal GrossSalary { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal RateOfELEncashment { get; set; }

        public int TotalEarnedLeaves { get; set; }

        public int LeavesTaken { get; set; }

        public int RemainingLeavesForEncashment { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalAmountOfELEncashment { get; set; }

        public DateTime DateOfPayment { get; set; }

        [StringLength(50)]
        public string Status { get; set; } // e.g., "Pending", "Paid"

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
