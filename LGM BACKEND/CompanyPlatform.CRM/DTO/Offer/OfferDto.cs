using CompanyPlatform.Core.DTO.Vendor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.DTO.Offer
{
    public class OfferDto
    {
        public int OfferId { get; set; }
        public int? EnquiryId { get; set; }
        public int? ServiceId { get; set; } 
        public string? ServiceDescription { get; set; }
        public int CreatedByEmployeeId { get; set; }
        public string OfferNo { get; set; }
        public string EnquiryNo { get; set; } 
        public DateTime OfferDate { get; set; }

        public DateTime? LatestRevisionDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int ProductGroupId { get; set; }
        public int CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyGST { get; set; }
        public string? CompanyPAN { get; set; }
        public string? CompanyFullAddress { get; set; }
        public int? VendorId { get; set; }
        public int CompanyGroupId { get; set; }
        public int CustomerId { get; set; }
        public int ResponsiblePersonId { get; set; }
        public string? ResponsiblePersonName { get; set; }
        public int AssignedToEmployeeId { get; set; }
        public string? AssignedEmployeeName { get; set; }
        public string? AssignedEmployeeMobile { get; set; }
        
        public int CurrencyId { get; set; }
        public int PlaceOfSupplyId { get; set; }
        public int BankDetailId { get; set; }
        public decimal Subtotal { get; set; }
        public decimal FreightCharges { get; set; }
        public decimal GrandTotal { get; set; }
        public string? TermsConditions { get; set; }
        public string? CustomerNotes { get; set; }
        public string Status { get; set; }
        public string? CustomerName { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public string Source { get; set; }
        public string? CurrencyName { get; set; }
        public string? CurrencySymbol { get; set; }
        public decimal? CurrencyValue { get; set; }
        public string? CustomerAddress { get; set; }
        public string? CompanyCode { get; set; }

        public string? VendorCode { get; set; }
        public string? VendorVatNo { get; set; }
        public string? VendorName { get; set; }
        public string? VendorGSTIN { get; set; }
        public string? VendorPAN { get; set; }
        public string? VendorContactPerson { get; set; }
        public string? VendorAddress { get; set; }

        public bool GSTApplicable { get; set; } = true;

        public VendorBankDetailDto? BankDetails { get; set; }
        public List<OfferVersionDto> VersionHistory { get; set; } = new();
        public List<OfferItemDto> Items { get; set; } = new();

        public List<OfferNoteDto>? Notes { get; set; } = new();
    }

    public class OfferItemDto
    {
        public string ItemType { get; set; } = "Product"; 
        public int? AccessoryId { get; set; }
        public int ProductId { get; set; }
        public int? ServiceId { get; set; }
        public string? ServicePartNo { get; set; }
        public string? Description { get; set; }
        public string? ProductDescription { get; set; }
        public string? AccessoriesDescription { get; set; }
        public string? ProductCode { get; set; }
        public string? HsnSacCode { get; set; }

        public int Quantity { get; set; }
        public decimal Rate { get; set; }

        public decimal? LiveConversionRate { get; set; }
        public decimal Discount { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal Total { get; set; }
        public decimal GstAmount { get; set; }
        public decimal? CgstAmount { get; set; }
        public decimal? SgstAmount { get; set; }
        public decimal? IgstAmount { get; set; }
        public decimal FinalPrice { get; set; }
        public List<int> AccessoryIds { get; set; } = new();
    }
    public class OfferVersionDto
    {
        public int VersionNumber { get; set; }
        public DateTime SavedAt { get; set; }
        public string AuthorName { get; set; }
        public string StatusAtMoment { get; set; }
        public string SnapshotDataJson { get; set; } // This contains the "Complete Info"
    }

    public class OfferNoteDto
    {
        public string? Note { get; set; }

        public DateTime? CreatedAt { get; set; }

        public int? CreatedByEmployeeId { get; set; }

        public string? AuthorName { get; set; }
    }

}
