using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.DTO.ProformaInvoice
{
    public class ProformaInvoiceDto
    {
        public int ProformaInvoiceId { get; set; }
        public string? ProformaInvoiceNo { get; set; }
        public DateTime ProformaInvoiceDate { get; set; }
        public DateTime ProformaInvoiceExpiryDate { get; set; }

        // Foreign Keys
        public int OrderAcceptanceId { get; set; }

        public int? ServiceReportId { get; set; }
        public int ProductGroupId { get; set; }
        public int CompanyId { get; set; }

        public string? CurrencySymbol { get; set; }
        public int? VendorId { get; set; }
        public int CompanyGroupId { get; set; }
        public int CustomerId { get; set; }

        public string? CustomerName { get; set; }
        public int? ResponsiblePersonId { get; set; }

        public string? ResponsiblePersonName { get; set; }
        public int CurrencyId { get; set; }
        public int PlaceOfSupplyId { get; set; }
        public int BankDetailId { get; set; }

        // Other Fields
        public string CustomerPO { get; set; }
        public DateTime? CustomerPODate { get; set; }
        public string ConsigneeNameAndAddress { get; set; }
        public string TermsAndConditions { get; set; }
        public string CustomerNotes { get; set; }

        // Totals
        public decimal Subtotal { get; set; }

        public decimal Percentage { get; set; }
        public decimal PercentageAmount { get; set; }

        public decimal PercentageTaxAmount { get; set; }

        public decimal TotalAmount { get; set; }
        public decimal BalanceAmount { get; set; }
        public decimal FreightOrCarrierInsurance { get; set; }
        public decimal TotalGstAmount { get; set; }
        public decimal GrandTotal { get; set; }


        public List<ProformaInvoiceItemDto> Items { get; set; } = new List<ProformaInvoiceItemDto>();
    }

    // --- DTO for Proforma Invoice Items ---

    public class ProformaInvoiceViewDto
    {
        public string? ProformaInvoiceNo { get; set; }
        public int PurchaseOrderId { get; set; }

        public DateTime ProformaInvoiceDate { get; set; }
        public DateTime ProformaInvoiceExpiryDate { get; set; }

        public int? ProductGroupId { get; set; }
        public int? CompanyId { get; set; }
        public int? VendorId { get; set; }
        public int? CompanyGroupId { get; set; }
        public int? CustomerId { get; set; }

        public string CustomerName { get; set; }
        public int? ResponsiblePersonId { get; set; }

        public string? ResponsiblePersonName { get; set; }

        public int? CurrencyId { get; set; }
        public string? CurrencyName { get; set; }
        public string? CurrencySymbol { get; set; }
        public int? PlaceOfSupplyId { get; set; }
        public int? BankDetailId { get; set; }

        public string? CustomerPo{ get; set; }


        public string? ConsigneeNameAndAddress { get; set; }
        public string? TermsAndConditions { get; set; }
        public string? CustomerNotes { get; set; }

        public decimal? Subtotal { get; set; }
        public decimal? FreightOrCarrierInsurance { get; set; }
        public decimal? TotalGstAmount { get; set; }
        public decimal? GrandTotal { get; set; }
        public int? OrderAcceptanceId { get; set; }

        public List<ProformaInvoiceItemDto> Items { get; set; } = new();
    }
    public class ProformaInvoiceItemDto
    {
        public string ItemType { get; set; } = "Product";
        public int ProductId { get; set; }

        public string? ProductName { get; set; }
        public int AccessoryId { get; set; }

        public string? ProductImage { get; set; }

        public string? HsnSacCode { get; set; }
        public string Description { get; set; }
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal? Discount { get; set; }

        public decimal TaxPercentage { get; set; }
        public decimal Total { get; set; }
        public decimal GstTax { get; set; }
        public decimal Price { get; set; }

        public List<int> AccessoryIds { get; set; } = new List<int>();
    }

    // --- Generic DTO for dropdown lists ---
    public class SelectOptionDto
    {
        public int Value { get; set; }
        public string Label { get; set; }
    }

    public class ProformaInvoiceListDto
    {
        public int ProformaInvoiceId { get; set; }
        public string ProformaInvoiceNo { get; set; }
        public string CustomerName { get; set; }
        public string CurrencyCode { get; set; } // e.g., USD, INR
        public string CurrencySymbol { get; set; } // e.g., $, ₹
        public decimal TotalAmount { get; set; }
        public DateTime CreatedDate { get; set; } // Mapped from CreatedOn
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } // Derived logic (Active/Expired)
    }

    public class ProformaInvoicePdfDto
    {
        // Company/Vendor Details (The Seller)
        public string CompanyName { get; set; }
        public string CompanyGstin { get; set; }
        public string CompanyPan { get; set; }

        public string Range { get; set; }
        public string CompanyAddress { get; set; }
        public string VendorCode { get; set; }

        // Invoice Details
        public string ProformaInvoiceNo { get; set; }
        public string ProformaInvoiceDate { get; set; }
        public string Division { get; set; }  // Or fetch dynamically if needed

        // Customer Details (The Buyer)
        public string CustomerName { get; set; }
        public string CustomerBillingAddress { get; set; }
        public string CustomerGstn { get; set; }
        public string CustomerPo { get; set; }
        public string CustomerPoDate { get; set; }
        public string CustomerState { get; set; }
        public string CustomerPlaceOfSupply { get; set; }

        // Consignee Details
        public string ConsigneeDetails { get; set; }

        // Items
        public List<InvoiceItemPdfDto> Items { get; set; }

        // Financials
        public decimal Subtotal { get; set; }

        public decimal TotalGstAmount { get; set; }

        public decimal Percentage { get; set; }
        public decimal PercentageAmount { get; set; }

        public decimal PercentageTaxAmount { get; set; }

        public decimal TotalAmount { get; set; }
        public decimal TotalCgst { get; set; }
        public decimal TotalSgst { get; set; }
        public decimal GrandTotal { get; set; }
        public string CurrencySymbol { get; set; }

        // Bank Details
        public string BankName { get; set; }
        public string BankAddress { get; set; }
        public string AccountNo { get; set; }
        public string IfscCode { get; set; }

        public string SacCode { get; set; }

        public string? DescriptionOfTaxableService { get; set; }
        public string CustomerStateCode { get; set; }

        public string PlaceOfSupply { get; set; }

        public string GrandTotalInWords { get; set; }   
        public string CgstInWords { get; set; }     
        public string SgstInWords { get; set; }

        public string AuthorizedSignatoryName { get; set; }
        public string DigitalSignatureDate { get; set; }

        public string CodeLabel { get; set; } = "SAC Code";
    }

    public class InvoiceItemPdfDto
    {
        public int SrNo { get; set; }
        public string ItemType { get; set; }
        public string ProductName { get; set; }
        public string Description { get; set; }
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
    }
}
