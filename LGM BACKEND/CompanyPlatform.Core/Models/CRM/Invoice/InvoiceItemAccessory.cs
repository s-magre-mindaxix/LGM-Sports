using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Invoice
{
    [Table("Tbl_InvoiceItemAccessory")]
    public class InvoiceItemAccessory
    {
        public int Id { get; set; }
        public int InvoiceItemId { get; set; }
        public int AccessoryId { get; set; }
        public InvoiceItem InvoiceItem { get; set; }
        public Accessories Accessory { get; set; }
    }
}
