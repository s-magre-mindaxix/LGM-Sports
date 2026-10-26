using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using CompanyPlatform.Core.Models.CRM.Employee;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_Payslip")]
    public class Payslip
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PayrollRunID { get; set; }
        [ForeignKey("PayrollRunID")]
        public PayrollRun PayrollRun { get; set; }

        [Required]
        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public Employees Employee { get; set; }

        [Required]
        [StringLength(500)]
        public string PdfFilePath { get; set; }

        public bool EmailSent { get; set; } = false;

        public bool Downloaded { get; set; } = false;

        public DateTime GeneratedOn { get; set; } = DateTime.UtcNow;
    }
}
