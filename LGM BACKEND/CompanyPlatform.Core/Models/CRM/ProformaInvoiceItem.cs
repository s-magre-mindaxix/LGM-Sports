using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_ProformaInvoiceItems")]
    public class ProformaInvoiceItem
    {
        [Key]
        public int ProformaInvoiceItemId { get; set; }

        [Required]
        [ForeignKey("ProformaInvoice")]
        public int ProformaInvoiceId { get; set; }

        
        [ForeignKey("Product")]
        public int? ProductId { get; set; }

        [ForeignKey("Accessory")]
        public int? AccessoryId { get; set; }

        public string Description { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Rate { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Discount { get; set; } // Discount amount or percentage

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Total { get; set; } // (Quantity * Rate) - Discount

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal GstTax { get; set; } // GST amount for this item

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Price { get; set; } // Final price for this item (Total + GstTax)


        public virtual ProformaInvoice ProformaInvoice { get; set; }
         public virtual Product Product { get; set; }
        public virtual Accessories? Accessory { get; set; }

        public decimal TaxPercentage { get; set; }

        public string? HsnSacCode { get; set; }

        public virtual ICollection<ProformaInvoiceItemAccessory> SelectedAccessories { get; set; } = new List<ProformaInvoiceItemAccessory>();
    }
}
