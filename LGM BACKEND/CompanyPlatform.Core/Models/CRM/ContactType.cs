using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_ContactType")]
    public class ContactType
    {
        [Key]
        public int ContactTypeId { get; set; }

        [Required, MaxLength(100)]
        public string Value { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string Code { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}