using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_Offers")]
    public class Offer
    {
        [Key]
        public int OfferId { get; set; }

      
        public int? EnquiryId { get; set; } 

        [Required]
        public string OfferNo { get; set; }

        public string EnquiryNo { get; set; } 
      

        [Required]
        public DateTime OfferDate { get; set; }
        public DateTime ExpiryDate { get; set; }

        // Master Links
        public int ProductGroupId { get; set; }
        public int CompanyId { get; set; }
        public int? VendorId { get; set; }
        public int CompanyGroupId { get; set; }
        public int CustomerId { get; set; }
        public int ResponsiblePersonId { get; set; }
        public int AssignedToEmployeeId { get; set; }
        public int CurrencyId { get; set; }
        public int PlaceOfSupplyId { get; set; }
        public int BankDetailId { get; set; }
        public int? ServiceId { get; set; }

        // Pricing Totals
        public decimal Subtotal { get; set; }
        public decimal FreightCharges { get; set; }
        public decimal GrandTotal { get; set; }
        public bool GSTApplicable { get; set; } = true;
        public string? TermsConditions { get; set; }
        public string? CustomerNotes { get; set; }
        public string Status { get; set; } = "ACTIVE";
        public bool IsDeleted { get; set; } = false;
        public string Source { get; set; } // "ENQUIRY" or "VERBAL"
        public DateTime? NextFollowUpDate { get; set; }
        public bool? FollowUpReminderSent { get; set; } = false;
        public string? FinalNote { get; set; }

        // Explicit relationship to versions
        public virtual ICollection<OfferVersion> Versions { get; set; } = new List<OfferVersion>();
        public virtual ICollection<OfferItem> Items { get; set; } = new List<OfferItem>();

        public virtual ICollection<OfferNote> OfferNotes { get; set; } = new List<OfferNote>();
    }
}
