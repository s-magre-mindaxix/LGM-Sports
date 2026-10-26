using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.DummyInvoice
{
    [Table("Tbl_DummyInvoiceItemAccessories")]
    public class DummyInvoiceItemAccessory
    {
        [Key]
        public int Id { get; set; }
        public int DummyInvoiceItemId { get; set; }
        public int AccessoryId { get; set; }
        [ForeignKey("DummyInvoiceItemId")]
        public virtual DummyInvoiceItem DummyInvoiceItem { get; set; }
    }
}
