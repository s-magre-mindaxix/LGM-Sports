
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.Inventory
{
    [Table("Location")]
    public class Location
    {
        [Key]
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

        [ForeignKey(nameof(WarehouseId))]
        public virtual Warehouse? Warehouse { get; set; }
    }
}
