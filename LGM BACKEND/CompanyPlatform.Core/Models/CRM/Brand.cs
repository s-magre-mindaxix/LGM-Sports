
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.Inventory
{
    [Table("Brand")]
    public class Brand
    {
        [Key]
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
