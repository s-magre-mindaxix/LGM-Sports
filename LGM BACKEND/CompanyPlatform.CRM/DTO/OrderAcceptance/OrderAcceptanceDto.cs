

using CompanyPlatform.Core.DTO.Vendor;
using System;
using System.Collections.Generic;

namespace CompanyPlatform.CRM.DTO.OrderAcceptance
{
  
    public class OfferSelectionDto
    {
        public int Value { get; set; }
        public string Label { get; set; }
        public int? CurrencyId { get; set; }
    }

    public class OfferSummaryDto
    {
        public int OfferId { get; set; }
        public string OfferNo { get; set; }
        public DateTime? OfferDate { get; set; }
        public string CustomerName { get; set; }
        public string CompanyName { get; set; }
        public string VendorName { get; set; }
        public string? CompanyCode { get; set; }
        public string? VendorCode { get; set; }
        public string GroupName { get; set; }
    }

    public class OrderAcceptanceItemDto
    {
        public int OrderAcceptanceItemId { get; set; }
        public string ItemType { get; set; } = "Product";
        public int ProductId { get; set; }
        public int AccessoryId { get; set; }
        public int ServiceId { get; set; }
        public string? ServicePartNo { get; set; }
        public string Description { get; set; }
        public string? PartNo { get; set; }
        public string? ProductDescription { get; set; }
        public string? AccessoriesDescription { get; set; }
        public string HsnSacCode { get; set; }
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Discount { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal Total { get; set; }
        public decimal GstAmount { get; set; }
        public decimal? CgstAmount { get; set; }
        public decimal? SgstAmount { get; set; }
        public decimal? IgstAmount { get; set; }
        public decimal FinalPrice { get; set; }
        public List<int> AccessoryIds { get; set; } = new List<int>();
        public string OfferNo { get; set; }
        public string? Source { get; set; }
    }

    public class OrderAcceptanceDto
    {
        public int OrderAcceptanceId { get; set; }

        public List<int> OfferIds { get; set; } = new List<int>();

        public List<OrderAcceptanceOfferDto> Offers { get; set; } = new List<OrderAcceptanceOfferDto>();

        public string GaxcePurchaseOrderNo { get; set; }
        public string? InvoiceNo { get; set; }
        public string CustomerOrderNo { get; set; }

        public DateTime? CustomerOrderDate { get; set; }

        public DateTime? OrderDate { get; set; }

        public DateTime? OfferCreateDate { get; set; }

        public DateTime? OfferExpiryDate { get; set; }

        public string CompanyCode { get; set; }

        public string? VendorCode { get; set; }
        public string? ForeignVendorCode { get; set; }
        public string? VendorVatNo { get; set; }

        public string Address { get; set; }

        public int? CustomerId { get; set; }

        public int? VendorId { get; set; }

        public int? CompanyId { get; set; }

        public int? ProductGroupId { get; set; }

        public int? CompanyGroupId { get; set; }

        public int? CurrencyId { get; set; }

        public int? PlaceOfSupplyId { get; set; }

        public int? BankDetailId { get; set; }

        public int? ResponsiblePersonId { get; set; }
        public string? ResponsiblePersonName { get; set; }

        public int? AssignedToEmployeeId { get; set; }

        public decimal? Subtotal { get; set; }

        public decimal? FreightCharges { get; set; }

        public decimal? GrandTotal { get; set; }

        public bool GstApplicable { get; set; } = true;

        public int? ServiceId { get; set; }
        public string TermsConditions { get; set; }

        public string CustomerNotes { get; set; }

        public string Status { get; set; }


        public string CustomerName { get; set; }
        public string? InvoiceAddress { get; set; }
        public string? ShippingAddress { get; set; }

        public string? VendorName { get; set; }
        public string? VendorAddress { get; set; }
        public VendorBankDetailDto?   BankDetails { get; set; }

        public List<OrderAcceptanceItemDto> Items { get; set; } = new List<OrderAcceptanceItemDto>();

        public List<OfferSummaryDto> SourceOfferSummaries { get; set; } = new List<OfferSummaryDto>();

        public List<OrderAcceptanceNoteDto> OrderAcceptanceNotes { get; set; } = new();

        public string OfferNo { get; set; }
        public string? Source { get; set; }

        public string? CurrencyName { get; set; }

        public string? CurrencySymbol { get; set; }
        public decimal? CurrencyValue { get; set; }



    }
    public class OrderAcceptanceOfferDto
    {
        public int OfferId { get; set; }

        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? ServiceDescription { get; set; }

        public int? ServiceId { get; set; }
        public string? Source { get; set; }

        public int? VendorId { get; set; }
        public string? VendorName { get; set; }

        public int? CompanyId { get; set; }
        public string? CompanyName { get; set; }

        public int? ProductGroupId { get; set; }
        public string? ProductGroupName { get; set; }

        public int? CompanyGroupId { get; set; }
        public string? CompanyGroupName { get; set; }

        public int? CurrencyId { get; set; }
        public string? CurrencyName { get; set; }
        public string? CurrencySymbol { get; set; }

        public int? PlaceOfSupplyId { get; set; }
        public string? PlaceOfSupplyName { get; set; }

        public int? BankDetailId { get; set; }
        public string? BankName { get; set; }

        public int? ResponsiblePersonId { get; set; }
        public string? ResponsiblePersonName { get; set; }

        public int? AssignedToEmployeeId { get; set; }
        public string? AssignedEmployeeName { get; set; }

        public string? OfferNo { get; set; }

        public DateTime? OfferCreateDate { get; set; }
        public DateTime? OfferExpiryDate { get; set; }

        public string? TermsConditions { get; set; }

        public DateTime? OrderDate { get; set; }

        public string? CompanyCode { get; set; }

        public string? VendorCode { get; set; }
        public string? ForeignVendorCode { get; set; }

        public string? Address { get; set; }

        public decimal? FreightCharges { get; set; }

        public string? CustomerNotes { get; set; }
    }

    public class OrderAcceptanceNoteDto
    {
        public int Id { get; set; }

        public string? Note { get; set; }

        public DateTime? CreatedAt { get; set; }

        public int? CreatedByEmployeeId { get; set; }

        public string? AuthorName { get; set; }
    }
}