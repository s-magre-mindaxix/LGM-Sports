using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.FinalDummyInvoice
{
    [Table("Tbl_FinalDummyInvoiceItems")]
    public class FinalDummyInvoiceItem
    {
        [Key]
        public int FinalDummyInvoiceItemId { get; set; }
        [Required]
        [ForeignKey("FinalDummyInvoice")]
        public int FinalDummyInvoiceId { get; set; }

        public int? ProductId { get; set; } // Will be null for manually added items
        public int? AccessoryId { get; set; } // Will be null for manually added items

        public string ItemType { get; set; }
        public string Description { get; set; }
        [Required]
        public decimal Quantity { get; set; } // Changed to decimal to match InvoiceItem
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Rate { get; set; }
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Discount { get; set; }
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Total { get; set; }
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal GstAmount { get; set; } // Renamed for clarity
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Price { get; set; }
        public decimal TaxPercentage { get; set; }
        public string? HsnSacCode { get; set; }

        // Navigation Property
        public virtual FinalDummyInvoice FinalDummyInvoice { get; set; }
        public virtual Product Product { get; set; }
        public virtual Accessories? Accessory { get; set; }
    }
}
