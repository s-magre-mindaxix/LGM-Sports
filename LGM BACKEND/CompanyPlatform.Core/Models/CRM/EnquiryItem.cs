using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_EnquiryItems")]
    public class EnquiryItem
    {
        [Key]
        public int EnquiryItemId { get; set; }

        public int EnquiryId { get; set; }
        public string ItemType { get; set; } = "Product";

        //[Required]
        public int? ProductId { get; set; }
        public int? AccessoryId { get; set; }

        public string? Description { get; set; }
        public string? HsnSacCode { get; set; }
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal? LiveConversionRate { get; set; }
        public decimal Discount { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal Total { get; set; }
        public decimal? CgstAmount { get; set; }
        public decimal? SgstAmount { get; set; }
        public decimal? IgstAmount { get; set; }
        public decimal GstAmount { get; set; }
        public decimal FinalPrice { get; set; }
        [ForeignKey("EnquiryId")]
        public virtual Enquiry Enquiry { get; set; }

        public int? ServiceId { get; set; }
        public string? ServicePartNo { get; set; }
        public virtual ICollection<EnquiryItemAccessory> SelectedAccessories { get; set; } = new List<EnquiryItemAccessory>();
    }
}
