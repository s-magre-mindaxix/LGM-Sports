using CompanyPlatform.Core.Models.CRM.Employee;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_EmployeeSalarySummary")]
    public class EmployeeSalarySummary
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal AnnualCTC { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal MonthlyGrossSalary { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal MonthlyTotalDeduction { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal MonthlyNetSalary { get; set; }

        public DateTime CalculationDate { get; set; }

        public DateTime EffectiveDate { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal EmployerPF { get; set; }
    }
}
