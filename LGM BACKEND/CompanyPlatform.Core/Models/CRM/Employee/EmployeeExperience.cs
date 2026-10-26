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
    [Table("tbl_EmployeeExperience")]
    public class EmployeeExperience
    {
        [Key]
        public int ID { get; set; }
        public int EmployeeID { get; set; }

        [Required]
        public string CompanyName { get; set; }

        [Required]
        public string Designation { get; set; }

        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }

        public string? Location { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }
    }
}
