using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_Department")]
    public class Department
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string DepartmentName { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
