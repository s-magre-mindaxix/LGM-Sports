

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.Inventory
{
    [Table("Branch")]
    public class Branch
    {
        [Key]
        public int BranchId { get; set; }

        [Required]
        public int CompanyId { get; set; }

        [Required]
        [StringLength(50)]
        public string BranchCode { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string BranchName { get; set; } = string.Empty;

        [StringLength(300)]
        public string? Address { get; set; }

        [StringLength(50)]
        public string? Contact { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey(nameof(CompanyId))]
        public virtual Company? Company { get; set; }
    }
}
