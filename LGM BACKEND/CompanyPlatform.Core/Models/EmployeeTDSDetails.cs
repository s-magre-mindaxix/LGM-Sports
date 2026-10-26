using CompanyPlatform.Core.Models.CRM.Employee;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_EmployeeTDSDetails")]
    public class EmployeeTDSDetails
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal TDSAmount { get; set; }

        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}