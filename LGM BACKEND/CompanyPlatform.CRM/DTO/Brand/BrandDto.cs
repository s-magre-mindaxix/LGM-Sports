
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTOs.Inventory
{
    public class BrandDto
    {
        public int BrandId { get; set; }

        [Required]
        [StringLength(50)]
        public string BrandCode { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string BrandName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}
