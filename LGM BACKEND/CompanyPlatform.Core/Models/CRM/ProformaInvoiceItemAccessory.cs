using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_ProformaInvoiceItemAccessories")]
    public class ProformaInvoiceItemAccessory
    {
        [Key]
        public int Id { get; set; }
        public int ProformaInvoiceItemId { get; set; }
        public int AccessoryId { get; set; }

        [ForeignKey("ProformaInvoiceItemId")]
        public virtual ProformaInvoiceItem ProformaInvoiceItem { get; set; }
    }
}
