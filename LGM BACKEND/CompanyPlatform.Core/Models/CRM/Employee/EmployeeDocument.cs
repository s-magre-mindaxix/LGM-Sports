using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Employee
{

    [Table("tbl_EmployeeDocument")]
    public class EmployeeDocument
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        [Required]
        public string DocumentName { get; set; }

        [Required]
        public string FilePath { get; set; }

        [Required]
        public DateTime UploadedDate { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }
    }
}
