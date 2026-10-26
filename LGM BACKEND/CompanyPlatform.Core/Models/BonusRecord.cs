using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using CompanyPlatform.Core.Models.CRM.Employee;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_BonusRecords")]
    public class BonusRecord
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }

        [Required]
        public string FinancialYear { get; set; } 

        [Column(TypeName = "decimal(18, 2)")]
        public decimal EligibleSalaryForCalculation { get; set; } 

        public int TenureInDays { get; set; } 

        public string AppliedRule { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal BonusAmount { get; set; }

        public DateTime CalculationDate { get; set; }

        public string Status { get; set; } 
    }
}
