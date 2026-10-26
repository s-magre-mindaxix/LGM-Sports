using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_SalaryComponent")]
    public class SalaryComponent
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string ComponentName { get; set; }

        [Required]
        [StringLength(50)]
        public string ComponentType {  get; set; }  

        public bool IsTaxable { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } 
    }
}
