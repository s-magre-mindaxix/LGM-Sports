using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_OfferVersions")]
    public class OfferVersion
    {
        [Key]
        public int Id { get; set; }

        public int OfferId { get; set; } // Reference to current Offer

        [Required]
        public string SnapshotDataJson { get; set; } // THE COMPLETE INFO (Items, Totals, Terms, etc.)

        public int VersionNumber { get; set; }
        public DateTime SavedAt { get; set; }
        public int SavedByEmployeeId { get; set; }
        public string AuthorName { get; set; }
        public string StatusAtMoment { get; set; } // DRAFT or FINAL

        [ForeignKey("OfferId")]
        public virtual Offer Offer { get; set; }
    }
}
