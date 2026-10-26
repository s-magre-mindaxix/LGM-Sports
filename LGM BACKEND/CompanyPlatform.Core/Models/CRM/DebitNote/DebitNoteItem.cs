using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.DebitNote
{
    [Table("Tbl_DebitNoteItem")]
    public class DebitNoteItem
    {
        [Key]
        public int DebitNoteItemId { get; set; }

        public int DebitNoteId { get; set; }

        public int? ProductId { get; set; }

        public int? AccessoryId { get; set; }

        public string ItemType { get; set; }

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

        [ForeignKey(nameof(DebitNoteId))]
        public DebitNote DebitNote { get; set; }

        public ICollection<DebitNoteItemAccessory> Accessories { get; set; }
    }
}
