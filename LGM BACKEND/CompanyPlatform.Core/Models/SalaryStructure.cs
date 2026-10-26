using CompanyPlatform.Core.Models.CRM.Employee;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_SalaryStructure")]
    public class SalaryStructure
    {
        [Key]
        public int Id { get; set; }

        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public Employees Employee { get; set; }

        public int SalaryComponentID { get; set; }

        [ForeignKey("SalaryComponentID")]
        public SalaryComponent SalaryComponent { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }
        public DateTime? EffectiveDate { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted {  get; set; }    
    }
}
