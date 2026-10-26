    using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_PurchaseOrderItems")]
    public class PurchaseOrderItem
    {
        [Key]
        public int PurchaseOrderItemId { get; set; }
        public int PurchaseOrderId { get; set; }
        public int? ProductId { get; set; }
        public int? AccessoryId { get; set; }
        public string ItemType { get; set; } = "Product";
        public string? Description { get; set; }
        public string? HsnSacCode { get; set; }
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Discount { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal Total { get; set; }
        public decimal? CgstAmount { get; set; }
        public decimal? SgstAmount { get; set; }
        public decimal? IgstAmount { get; set; }
        public decimal GstAmount { get; set; }
        public decimal FinalPrice { get; set; }
        public string? SourceOA { get; set; }
       
public string? ProductSource { get; set; }

        [ForeignKey("PurchaseOrderId")]
        public virtual PurchaseOrder PurchaseOrder { get; set; }
        public virtual ICollection<PurchaseOrderItemAccessory> SelectedAccessories { get; set; } = new List<PurchaseOrderItemAccessory>();
    }
}

