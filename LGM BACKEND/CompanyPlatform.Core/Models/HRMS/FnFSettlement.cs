
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
    [Table("tbl_FnFSettlements")]
    public class FnFSettlement
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        [ForeignKey(nameof(EmployeeID))]
        public virtual Employees? Employee { get; set; }

        public DateTime ResignationDate { get; set; }
        public DateTime LastWorkingDay { get; set; }

        // A. Salary
        public string ExitMonth { get; set; }
        public int TotalDaysInMonth { get; set; }
        public int PaidDays { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal MonthlyGrossSalary { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SalaryPayable { get; set; }

        // B. Leave Encashment
        public int EncashableLeaveBalance { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal LeaveEncashmentRate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal LeaveEncashmentAmount { get; set; }

        // C. Bonus
        [Column(TypeName = "decimal(18,2)")]
        public decimal BonusAmount { get; set; }

        public string BonusRemarks { get; set; }

        // D. Gratuity
        [Column(TypeName = "decimal(18,2)")]
        public decimal GratuityAmount { get; set; }

        // E. Notice Period
        [Column(TypeName = "decimal(18,2)")]
        public decimal NoticePeriodAmount { get; set; }

        public string NoticePeriodRemarks { get; set; }

        // F. Other Deductions
        [Column(TypeName = "decimal(18,2)")]
        public decimal OtherDeductions { get; set; }

        public string DeductionRemarks { get; set; }

        // Final
        [Column(TypeName = "decimal(18,2)")]
        public decimal NetPayableAmount { get; set; }

        [Required]
        public string Status { get; set; } // Draft / Approved / Paid

        public DateTime SettlementDate { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;
    }
}
