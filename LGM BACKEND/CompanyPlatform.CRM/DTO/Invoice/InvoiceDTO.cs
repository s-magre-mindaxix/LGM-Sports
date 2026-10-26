using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.DTO.Invoice
{

    public class SaveInvoiceDTO
    {
        public int InvoiceId { get; set; }

        public int? OrderAcceptanceId { get; set; }
        public string? InvoiceNo { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime InvoiceDueDate { get; set; }

        public string CustomerPo { get; set; }
        public DateTime CompanyPoDate { get; set; }

        public string ConsigneeNameAddress { get; set; }
        public string Description { get; set; }

        public decimal SubTotal { get; set; }

        public bool AdvanceReceived { get; set; }

        public decimal AdvanceAmount { get; set; }

        public decimal BalanceAmount { get; set; }
        public decimal FreightCharges { get; set; }
        public decimal GrandTotal { get; set; }
        public int ProductGroupId { get; set; }
        public int CompanyId { get; set; }
        public int VendorId { get; set; }
        public int CustomerId { get; set; }
        public int CompanyGroupId { get; set; }
        public int? ResponsiblePersonId { get; set; }
        public int CurrencyId { get; set; }
        public int PlaceOfSupplyId { get; set; }
        public int BankDetailId { get; set; }

        public int? ServiceId { get; set; }

        public int? ServiceReportId { get; set; }
        public string TermsConditions { get; set; }
        public string CustomerNotes { get; set; }

        public List<SaveInvoiceItemDTO> Items { get; set; }
    }

    public class InvoiceDTO
    {
        public int InvoiceId { get; set; }

        public string InvoiceNo { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime InvoiceDueDate { get; set; }

        public string CustomerPo { get; set; }
        public DateTime CompanyPoDate { get; set; }

        public string ConsigneeNameAddress { get; set; }
        public string Description { get; set; }

        public decimal SubTotal { get; set; }
        public decimal FreightCharges { get; set; }
        public decimal GrandTotal { get; set; }

        public bool AdvanceReceived { get; set; }

        public decimal AdvanceAmount { get; set; }

        public decimal BalanceAmount { get; set; }
        public int ProductGroupId { get; set; }
        public string ProductGroupName { get; set; }
        public int CompanyId { get; set; }
        public string CompanyName { get; set; }

        public int? VendorId { get; set; }
        public string VendorName { get; set; }

        public int CustomerId { get; set; }
        public string CustomerName { get; set; }

        public int CompanyGroupId { get; set; }
        public int? ResponsiblePersonId { get; set; }

        public int CurrencyId { get; set; }
        public string CurrencyName { get; set; }
        public string CurrencySymbol { get; set; }
        public int PlaceOfSupplyId { get; set; }
        public int BankDetailId { get; set; }

        public string TermsConditions { get; set; }
        public string CustomerNotes { get; set; }
        public string CompanyGroupName { get; set; }
        public string ResponsiblePersonName { get; set; }
        public string PlaceOfSupplyName { get; set; }

        public string BankName { get; set; }
        public string AccountNo { get; set; }
        public string IFSC { get; set; }
        public string BankAddress { get; set; }
        public string AccountHolderName { get; set; }

        public List<InvoiceItemDTO> Items { get; set; }
    }

    public class InvoiceItemDTO
    {
        public int? ProductId { get; set; } 
        public int? AccessoryId { get; set; }
        public string ItemType { get; set; }
        public string ProductName { get; set; }

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
        public List<int> AccessoryIds { get; set; }
        public List<string> AccessoryNames { get; set; }
    }

    public class SaveInvoiceItemDTO
    {
        public int? ProductId { get; set; }
        public int? AccessoryId { get; set; }
        public string ItemType { get; set; } = "Product";

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

        public List<int> AccessoryIds { get; set; }
    }

    public class InvoicePdfDto
    {
        // Company & Invoice Details
        public string CompanyName { get; set; }
        public string CompanyAddress { get; set; }
        public string CompanyGstin { get; set; }
        public string CompanyPan { get; set; }
        public string Range { get; set; }
        public string Division { get; set; }
        public string VendorCode { get; set; }
        public string InvoiceNo { get; set; }
        public string InvoiceDate { get; set; }
        public string SacCode { get; set; }
        public string TaxableServiceDescription { get; set; }

        // Buyer Details
        public string BuyerName { get; set; }
        public string BuyerAddress { get; set; }
        public string BuyerGstin { get; set; }
        public string BuyerState { get; set; }
        public string BuyerStateCode { get; set; }
        public string CustomerPo { get; set; }
        public string CompanyPoDate { get; set; }
        public string PlaceOfSupply { get; set; }

        // Consignee Details (Can be same as Buyer)
        public string ConsigneeName { get; set; }
        public string ConsigneeAddress { get; set; }
        public string ConsigneeGstin { get; set; }
        public string ConsigneeState { get; set; }
        public string ConsigneeStateCode { get; set; }

        public string CurrencySymbol { get; set; }
        // Items
        public List<InvoiceItemPdfDto> Items { get; set; }

        // Totals
        public decimal ValueOfGoods { get; set; } // Same as Subtotal
        public decimal TotalCgst { get; set; }
        public decimal TotalSgst { get; set; }

        public decimal TotalIgst { get; set; }
        public decimal GrandTotal { get; set; }

        public decimal AdvanceAmount { get; set; }
        public decimal BalanceAmount { get; set; }

        // Totals in Words
        public string GrandTotalInWords { get; set; }
        public string CgstInWords { get; set; }
        public string SgstInWords { get; set; }

        public string IgstInWords { get; set; }

        // Footer
        public string AuthorizedSignatoryName { get; set; }
        public string DigitalSignatureDate { get; set; }
    }

    public class InvoiceItemPdfDto
    {
        public int SrNo { get; set; }
        public string Description { get; set; }
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
    }

    public class SelectableOrderAcceptanceDTO
    {
        public int Value { get; set; }
        public string Label { get; set; }
    }

    public class SelectableSerialNumberDTO
    {
        public int Value { get; set; } // ServiceReportId
        public string Label { get; set; } // Serial Number
    }

    public class ServiceReportInvoiceDTO
    {
        public string? InvoiceNo { get; set; }
        public int? ProductGroupId { get; set; }
        public int? CompanyId { get; set; }
        public int? VendorId { get; set; }
        public int? CustomerId { get; set; }
        public int? CompanyGroupId { get; set; }
        public int? ResponsiblePersonId { get; set; }
        public int? CurrencyId { get; set; }
        public int? PlaceOfSupplyId { get; set; }
        public int? BankDetailId { get; set; }

        public int? ServiceId { get; set; }

        public int? ServiceReportId { get; set; }
        public string TermsConditions { get; set; }
        public string CustomerNotes { get; set; }
        public string ConsigneeNameAddress { get; set; }

        public string CustomerPo { get; set; }
        public DateTime? CompanyPoDate { get; set; }

        public decimal FreightCharges { get; set; }

        public List<OrderAcceptanceItemForInvoiceDTO> Items { get; set; }
    }


    // For populating the invoice form with data from an Order Acceptance
    public class OrderAcceptanceForInvoiceDTO
    {
        public int OrderAcceptanceId { get; set; }
        public string? InvoiceNo { get; set; }
        public int? ProductGroupId { get; set; }
        public int? CompanyId { get; set; }
        public int? VendorId { get; set; }
        public int? CustomerId { get; set; }
        public int? CompanyGroupId { get; set; }
        public int? ResponsiblePersonId { get; set; }
        public int? CurrencyId { get; set; }
        public int? PlaceOfSupplyId { get; set; }
        public int? BankDetailId { get; set; }
        public string TermsConditions { get; set; }
        public string CustomerNotes { get; set; }
        public string ConsigneeNameAddress { get; set; }
        public string CustomerPo { get; set; }
        public DateTime? CompanyPoDate { get; set; }
        public decimal FreightCharges { get; set; }

        public int? ServiceId { get; set; }
        public List<OrderAcceptanceItemForInvoiceDTO> Items { get; set; }
    }

    public class OrderAcceptanceItemForInvoiceDTO
    {
        public int? ProductId { get; set; }
        public int? AccessoryId { get; set; }

        public int? ServiceId { get; set; }

        public string ItemType { get; set; }
        public string Description { get; set; }
        public string HsnSacCode { get; set; }
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Discount { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal Total { get; set; }
        public decimal GstAmount { get; set; }
        public decimal? CgstAmount { get; set; }
        public decimal? SgstAmount { get; set; }
        public decimal? IgstAmount { get; set; }
        public decimal FinalPrice { get; set; }
        public List<int> AccessoryIds { get; set; }
    }

    public class SelectableProformaInvoiceDTO
    {
        public int Value { get; set; }
        public string Label { get; set; }
    }
}
