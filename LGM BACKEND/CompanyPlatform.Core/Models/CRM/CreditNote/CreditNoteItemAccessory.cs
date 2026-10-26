using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.CreditNote
{
    [Table("Tbl_CreditNoteItemAccessory")]
    public class CreditNoteItemAccessory
    {
        [Key]
        public int Id { get; set; }

        public int CreditNoteItemId { get; set; }

        public int AccessoryId { get; set; }

        public CreditNoteItem CreditNoteItem { get; set; }

        public Accessories Accessory { get; set; }
    }
}
