using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.DummyInvoice
{
    [Table("Tbl_DummyInvoiceItems")]
    public class DummyInvoiceItem
    {
        [Key]
        public int DummyInvoiceItemId { get; set; }
        [Required]
        [ForeignKey("DummyInvoice")]
        public int DummyInvoiceId { get; set; }
        public int? ProductId { get; set; } // Will be null for manually added items
        public int? AccessoryId { get; set; } // Will be null for manually added items
        public string Description { get; set; }
        [Required]
        public int Quantity { get; set; }
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
        public decimal GstTax { get; set; }
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Price { get; set; }
        public decimal TaxPercentage { get; set; }
        public string? HsnSacCode { get; set; }
        public virtual DummyInvoice DummyInvoice { get; set; }
        public virtual Product Product { get; set; }
        public virtual Accessories? Accessory { get; set; }
        public virtual ICollection<DummyInvoiceItemAccessory> SelectedAccessories { get; set; } = new List<DummyInvoiceItemAccessory>();
    }
}
