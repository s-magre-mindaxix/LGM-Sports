
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.Inventory
{
    [Table("Warehouse")]
    public class Warehouse
    {
        [Key]
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

        [ForeignKey(nameof(BranchId))]
        public virtual Branch? Branch { get; set; }
    }
}
