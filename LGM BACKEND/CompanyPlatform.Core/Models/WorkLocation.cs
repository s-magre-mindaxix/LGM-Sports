using CompanyPlatform.Core.Models.CRM.Employee;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_WorkLocation")]
    public class WorkLocation
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [StringLength(100)]
        public string LocationName { get; set; } 

        [StringLength(50)]
        public string? LocationCode { get; set; } 

        [Required]
        public string Address { get; set; } 

        [Required]
        [StringLength(100)]
        public string City { get; set; } 

        [Required]
        [StringLength(100)]
        public string State { get; set; } 

        [Required]
        [StringLength(10)]
        public string Pincode { get; set; } 

        [DefaultValue(true)]
        public bool IsActive { get; set; } 

        [DefaultValue(false)]
        public bool IsDeleted { get; set; } 

        public virtual ICollection<Employees> Employees { get; set; }

    }
}
