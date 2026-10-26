using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_OfferNotes")]
    public class OfferNote
    {
        [Key]
        public int Id { get; set; }

        public int OfferId { get; set; }

        public string Note { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public int CreatedByEmployeeId { get; set; }

        public string AuthorName { get; set; }

        [ForeignKey("OfferId")]
        public virtual Offer Offer { get; set; }
    }
}
