using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_OfferItems")]
    public class OfferItem
    {
        [Key]
        public int OfferItemId { get; set; }
        public int OfferId { get; set; }
        public int? ProductId { get; set; }
        public int? AccessoryId { get; set; }
        public int? ServiceId { get; set; }
        public string? ServicePartNo { get; set; }
        public string ItemType { get; set; } = "Product";

        public string? Description { get; set; }
        public string? HsnSacCode { get; set; }

        public int Quantity { get; set; }
        public decimal Rate { get; set; }

        public decimal? LiveConversionRate { get; set; }
        public decimal Discount { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal Total { get; set; }
        public decimal GstAmount { get; set; }
        public decimal? CgstAmount { get; set; }
        public decimal? SgstAmount { get; set; }
        public decimal? IgstAmount { get; set; }
        public decimal FinalPrice { get; set; }

        [ForeignKey("OfferId")]
        public virtual Offer Offer { get; set; }



        public virtual ICollection<OfferItemAccessory> SelectedAccessories { get; set; } = new List<OfferItemAccessory>();
    }
}
