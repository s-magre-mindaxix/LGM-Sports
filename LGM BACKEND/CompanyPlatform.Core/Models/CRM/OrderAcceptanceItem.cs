using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_OrderAcceptanceItems")]
    public class OrderAcceptanceItem
    {
        [Key]
        public int OrderAcceptanceItemId { get; set; }
        public int OrderAcceptanceId { get; set; }
        public int? ProductId { get; set; }
        public int? AccessoryId { get; set; }
        public int? ServiceId { get; set; }
        public string? ServicePartNo { get; set; }
        public string ItemType { get; set; } = "Product";
        public string? Description { get; set; }
        public string? HsnSacCode { get; set; } 

        public int Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Discount { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal Total { get; set; }
        public decimal GstAmount { get; set; }
        public decimal? CgstAmount { get; set; }
        public decimal? SgstAmount { get; set; }
        public decimal? IgstAmount { get; set; }
        public decimal FinalPrice { get; set; }

        [ForeignKey("OrderAcceptanceId")]
        public virtual OrderAcceptance OrderAcceptance { get; set; }
        public virtual ICollection<OrderAcceptanceItemAccessory> SelectedAccessories { get; set; } = new List<OrderAcceptanceItemAccessory>();
    }
}