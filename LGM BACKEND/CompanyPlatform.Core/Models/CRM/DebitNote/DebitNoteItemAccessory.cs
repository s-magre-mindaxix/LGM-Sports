using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.DebitNote
{
    [Table("Tbl_DebitNoteItemAccessory")]
    public class DebitNoteItemAccessory
    {
        [Key]
        public int Id { get; set; }

        public int DebitNoteItemId { get; set; }

        public int AccessoryId { get; set; }

        public DebitNoteItem DebitNoteItem { get; set; }

        public Accessories Accessory { get; set; }
    }
}
