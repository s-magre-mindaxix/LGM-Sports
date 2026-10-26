using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Invoice
{
    [Table("Tbl_InvoiceItem")]
    public class InvoiceItem
    {
        public int InvoiceItemId { get; set; }
        public int InvoiceId { get; set; }
        public int? ProductId { get; set; }
        public int? AccessoryId { get; set; }
        public string ItemType { get; set; } = "Product";
        public string Description { get; set; }
        public string HsnSacCode { get; set; }
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
        public decimal GstAmount { get; set; }
        public decimal CgstAmount { get; set; }
        public decimal SgstAmount { get; set; }
        public decimal IgstAmount { get; set; }
        public decimal Price { get; set; }
        public decimal TaxPercentage { get; set; }

        [ForeignKey("InvoiceId")]
        public virtual Invoice Invoice { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; }
        public ICollection<InvoiceItemAccessory> Accessories { get; set; }

    }
}
