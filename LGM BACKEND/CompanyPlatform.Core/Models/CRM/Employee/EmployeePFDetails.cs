using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace CompanyPlatform.Core.Models.CRM.Employee
{
    [Table("tbl_EmployeePFDetails")]
    public class EmployeePFDetails
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        [Required]
        [Column(TypeName = "decimal(5, 2)")]
        [Range(0, 100, ErrorMessage = "PF Deduction Percentage must be between 0 and 100.")]
        public decimal PFDeductionPercentage { get; set; }

        [Required]
        public bool IsCappedAt15k { get; set; }

        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
