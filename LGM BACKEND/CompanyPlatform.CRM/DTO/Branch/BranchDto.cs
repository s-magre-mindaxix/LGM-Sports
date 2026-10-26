
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTOs.Inventory
{
    public class BranchDto
    {
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
    }
}
