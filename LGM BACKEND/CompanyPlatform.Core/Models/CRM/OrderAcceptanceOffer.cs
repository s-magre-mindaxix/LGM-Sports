using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_OrderAcceptanceOffers")]
    public class OrderAcceptanceOffer
    {
        [Key]
        public int Id { get; set; }

        public int OrderAcceptanceId { get; set; }

        public int OfferId { get; set; }

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

        public DateTime? OfferCreateDate { get; set; }

        public DateTime? OfferExpiryDate { get; set; }

        public string? TermsConditions { get; set; }

        public DateTime? OrderDate { get; set; }

        public string? CompanyCode { get; set; }

        public string? VendorCode { get; set; }

        public string? Address { get; set; }

        public decimal? FreightCharges { get; set; }

        public string? CustomerNotes { get; set; }
        public int? ServiceId { get; set; }

        [ForeignKey("OrderAcceptanceId")]
        public virtual OrderAcceptance OrderAcceptance { get; set; }

        [ForeignKey("OfferId")]
        public virtual Offer Offer { get; set; }
    }
}