using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_PurchaseOrders")]
    public class PurchaseOrder
    {
        [Key]
        public int PurchaseOrderId { get; set; }

        public int? OrderAcceptanceId { get; set; } 

        [Required]
        public string PurchaseOrderNo { get; set; }

        public string? GaxcePurchaseOrderNo { get; set; } 
        public string? CustomerOrderNo { get; set; }     

        public DateTime? CustomerOrderDate { get; set; }
        public DateTime? PurchaseOrderDate { get; set; }
        public string? InvoiceNo { get; set; }
        public DateTime? InvoiceDate { get; set; }

        public DateTime? OfferCreateDate { get; set; }
        public DateTime? OfferExpiryDate { get; set; }
        public string? CompanyCode { get; set; }
        public string? VendorCode { get; set; }

        // Master Links
        public int? CustomerId { get; set; }
        public int? VendorId { get; set; }
        public int? CompanyId { get; set; }
        public int? ProductGroupId { get; set; }
        public int? CompanyGroupId { get; set; }
        public int? CurrencyId { get; set; }
        public int? PlaceOfSupplyId { get; set; }
        public int? BankDetailId { get; set; }
        public int? ResponsiblePersonId { get; set; }
        public int? AssignedToEmployeeId { get; set; }

        public decimal? Subtotal { get; set; }
        public decimal? FreightCharges { get; set; }
        public decimal? GrandTotal { get; set; }
        public DateTime? NextFollowUpDate { get; set; } 


        public string? Address { get; set; }
        public string? TermsConditions { get; set; }
        public string? CustomerNotes { get; set; }
        public string? Status { get; set; } = "DRAFT";
        public string? FinalNote { get; set; }
        public bool IsDeleted { get; set; } = false;
        public virtual ICollection<PurchaseOrderOffer> SelectedOffers { get; set; } = new List<PurchaseOrderOffer>();
        public virtual ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
    }
}