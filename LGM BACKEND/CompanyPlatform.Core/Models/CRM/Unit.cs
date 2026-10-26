
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.Inventory
{
    [Table("Unit")]
    public class Unit
    {
        [Key]
        public int UnitId { get; set; }

        [Required]
        [StringLength(50)]
        public string UnitCode { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string UnitName { get; set; } = string.Empty;

        public bool DecimalAllowed { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}
