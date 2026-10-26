using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Employee
{
    [Table("tbl_EmployeeQualification")]
    public class EmployeeQualification
    {
        [Key]
        public int ID { get; set; }
        public int EmployeeID { get; set; }

        [Required]
        public string Degree { get; set; } 

        [Required]
        public string University { get; set; }

        [Required]
        public string PassingYear { get; set; }

        public decimal Percentage { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }
    }
}
