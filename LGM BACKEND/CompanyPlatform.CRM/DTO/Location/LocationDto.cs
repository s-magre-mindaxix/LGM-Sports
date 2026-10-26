
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTOs.Inventory
{
    public class LocationDto
    {
        public int LocationId { get; set; }

        [Required]
        public int WarehouseId { get; set; }

        [Required]
        [StringLength(50)]
        public string LocationCode { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Zone { get; set; }

        [StringLength(100)]
        public string? Rack { get; set; }

        [StringLength(100)]
        public string? Shelf { get; set; }

        [StringLength(100)]
        public string? Bin { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}
