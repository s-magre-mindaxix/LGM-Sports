using CompanyPlatform.Core.Models.CRM.Employee;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_MonthlySalaryRecord")]
    public class MonthlySalaryRecord
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PayrollRunID { get; set; }
        [ForeignKey("PayrollRunID")]
        public virtual PayrollRun PayrollRun { get; set; }

        [Required]
        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }

        public int TotalDaysInMonth { get; set; }
        public decimal PayableDays { get; set; }
        public decimal LOPDays { get; set; } 

        [Column(TypeName = "decimal(18, 2)")]
        public decimal GrossEarnings { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalDeductions { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal NetSalary { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal ReimbursableAmount { get; set; } 

        public string? Remarks { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal EmployerPF { get; set; }

        // ✅ ADD THESE NEW PROPERTIES
        public decimal PresentDays { get; set; }
        public decimal WeeklyOffAndHolidays { get; set; }
        public decimal CasualLeaveDays { get; set; }

        public virtual ICollection<MonthlySalaryComponentDetail> ComponentDetails { get; set; }
    }
}
