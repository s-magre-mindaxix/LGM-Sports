using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_Enquiries")]
    public class Enquiry
    {
        [Key]
        public int EnquiryId { get; set; }
        public string? EnquiryNo { get; set; }

        public DateTime? OfferDate { get; set; } 

        public DateTime? ExpiryDate { get; set; }

        public int? ServiceId { get; set; }

        public int? ProductGroupId { get; set; } 
        public int? CompanyId { get; set; }
        public int? VendorId { get; set; } 
        public int? CompanyGroupId { get; set; } 
        public int? CustomerId { get; set; }
        [ForeignKey("CustomerId")]
        public virtual Customer Customer { get; set; }
        public int? ResponsiblePersonId { get; set; } 

        public int? CurrencyId { get; set; } 
        public int? PlaceOfSupplyId { get; set; } 
        public int? BankDetailId { get; set; } 
        public decimal? Subtotal { get; set; } 
        public decimal? FreightCharges { get; set; } 
        public decimal? GrandTotal { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public bool GSTApplicable { get; set; } = true;

        public string? TermsConditions { get; set; }
        public string? CustomerNotes { get; set; }
        public bool IsDeleted { get; set; } = false;

        public virtual ICollection<EnquiryItem> Items { get; set; } = new List<EnquiryItem>();

        public string? Status { get; set; } = "DRAFT";
        public string? EntryType { get; set; } = "ENQUIRY"; 
        public int? AssignedToEmployeeId { get; set; }
        public bool? FollowUpReminderSent { get; set; } = false;

        public virtual ICollection<EnquiryNote> EnquiryNotes { get; set; } = new List<EnquiryNote>();

    }
}