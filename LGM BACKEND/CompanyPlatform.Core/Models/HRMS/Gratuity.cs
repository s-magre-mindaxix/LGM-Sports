
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using CompanyPlatform.Core.Models.CRM.Employee;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.HRMS
{
    [Table("tbl_Gratuity")]
    public class Gratuity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }

        [Required]
        public decimal YearsOfService { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal LastDrawnBasicSalary { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal GratuityAmount { get; set; }

        [Required]
        public DateTime CalculationDate { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } // e.g., "Eligible", "Not-Eligible", "Paid"

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
