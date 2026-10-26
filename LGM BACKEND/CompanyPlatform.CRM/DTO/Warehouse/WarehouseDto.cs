
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTOs.Inventory
{
    public class WarehouseDto
    {
        public int WarehouseId { get; set; }

        [Required]
        public int BranchId { get; set; }

        [Required]
        [StringLength(50)]
        public string WarehouseCode { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string WarehouseName { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Type { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}
