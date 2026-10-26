using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP
{
    [Table("Tbl_DispatchStockItems")]
    public class DispatchStockItem
    {
        [Key]
        public int DispatchStockItemId { get; set; }

        public int DispatchId { get; set; }

        public string ItemType { get; set; } = string.Empty;   // Product / Accessory

        public int? ProductId { get; set; }

        public int? AccessoryId { get; set; }

        [StringLength(100)]
        public string? ItemCode { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public decimal Qty { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }

        [ForeignKey(nameof(DispatchId))]
        public virtual Dispatch Dispatch { get; set; }
    }
}
