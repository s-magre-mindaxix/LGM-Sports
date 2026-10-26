using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("bde_user")]
    public class BDEUser
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public string Value { get; set; }

        [Required]
        public string Code { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}