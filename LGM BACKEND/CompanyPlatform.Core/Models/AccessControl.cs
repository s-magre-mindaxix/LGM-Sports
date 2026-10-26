using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.Models
{
    public class AccessControl
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string RoleId { get; set; }

        [ForeignKey("RoleId")]
        public virtual IdentityRole Role { get; set; }

        [Required]
        [MaxLength(100)]
        public string SystemName { get; set; }

        [Required]
        [MaxLength(100)]
        public string FormName { get; set; } 

        public bool CanView { get; set; }
        public bool CanAdd { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool IsDeleted { get; set; } = false;

    }
}
