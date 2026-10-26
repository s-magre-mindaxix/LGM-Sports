using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.DTO.DebitNote
{
    public class DebitNoteDto
    {
        public int DebitNoteId { get; set; }

        public string DebitNoteNo { get; set; }

        public DateTime DebitNoteDate { get; set; }

        public int InvoiceId { get; set; }

        public string InvoiceNo { get; set; }

        public DateTime InvoiceDate { get; set; }

        public DateTime InvoiceDueDate { get; set; }

        public string CustomerPo { get; set; }

        public DateTime CompanyPoDate { get; set; }

        public string ConsigneeNameAddress { get; set; }

        public string Description { get; set; }

        // Company
        public string CompanyName { get; set; }

        public string CompanyGroupName { get; set; }

        public string ProductGroupName { get; set; }

        // Customer
        public string CustomerName { get; set; }

        public string PlaceOfSupplyName { get; set; }

        // Vendor
        public string VendorName { get; set; }

        // Currency
        public string CurrencyName { get; set; }

        public string CurrencySymbol { get; set; }

        // Bank
        public string BankName { get; set; }

        public string AccountNo { get; set; }

        public string Ifsc { get; set; }

        // Amount
        public decimal SubTotal { get; set; }

        public decimal FreightCharges { get; set; }

        public decimal GrandTotal { get; set; }

        public decimal AdvanceAmount { get; set; }

        public decimal BalanceAmount { get; set; }

        public decimal AdjustAmount { get; set; }

        public decimal UpdatedBalanceAmount { get; set; }

        public string DebitReason { get; set; }

        public List<DebitNoteItemDto> Items { get; set; }
    }

    public class DebitNoteItemDto
    {
        public int DebitNoteItemId { get; set; }

        public int? ProductId { get; set; }

        public string Description { get; set; }

        public string HsnSacCode { get; set; }

        public decimal Quantity { get; set; }

        public decimal Rate { get; set; }

        public decimal Total { get; set; }

        public decimal GstAmount { get; set; }

        public decimal CgstAmount { get; set; }

        public decimal SgstAmount { get; set; }

        public decimal IgstAmount { get; set; }

        public decimal Price { get; set; }

        public string ItemType { get; set; }
    }

    public class CreateDebitNoteDto
    {
        public int InvoiceId { get; set; }

        public string DebitNoteNo { get; set; }

        public decimal AdjustAmount { get; set; }

        public string DebitReason { get; set; }
    }

    public class DebitNoteListDto
    {
        public int DebitNoteId { get; set; }

        public string DebitNoteNo { get; set; }

        public DateTime DebitNoteDate { get; set; }

        public string InvoiceNo { get; set; }

        public decimal AdjustAmount { get; set; }

        public decimal UpdatedBalanceAmount { get; set; }

        public string DebitReason { get; set; }
    }

    public class InvoiceDropdownDtos
    {
        public int InvoiceId { get; set; }

        public string InvoiceNo { get; set; }
    }

    public class DebitNotePdfDto
    {
        public int DebitNoteId { get; set; }

        public string DebitNoteNo { get; set; }

        public DateTime DebitNoteDate { get; set; }

        // Invoice Details
        public int InvoiceId { get; set; }

        public string InvoiceNo { get; set; }

        public DateTime InvoiceDate { get; set; }

        // Company Details
        public string CompanyName { get; set; }

        public string CompanyAddress { get; set; }

        public string GstNo { get; set; }

        public string PanNo { get; set; }

        // Tax Details
        public string Range { get; set; }

        public string Division { get; set; }

        public string Commissionerate { get; set; }

        public string SacCode { get; set; }

        public string TaxableServiceDescription { get; set; }

        // Customer Details
        public string ReturnDebitTo { get; set; }

        public string CustomerAddress { get; set; }

        public DateTime? ReturnDebitDate { get; set; }

        public string ReturnDebitNo { get; set; }

        public string ConsigneeNameAddress { get; set; }

        public string StateName { get; set; }

        public string StateCode { get; set; }

        public string GstnNo { get; set; }

        // Bank Details
        public string BankName { get; set; }

        public string AccountNo { get; set; }

        public string? BankAddress { get; set; }

        public string IfscCode { get; set; }

        // Amount Details
        public decimal DebitNoteAmount { get; set; }

        public string DebitNoteAmountInWords { get; set; }

        public decimal SubTotal { get; set; }

        public decimal FreightCharges { get; set; }

        public string GrandTotalInWords { get; set; }

        public decimal GrandTotal { get; set; }

        public decimal AdvanceAmount { get; set; }

        public decimal BalanceAmount { get; set; }

        public decimal UpdatedBalanceAmount { get; set; }

        // Debit Note Specific
        public string DebitReason { get; set; }

        // Item Details
        public List<DebitNotePdfItemDto> Items { get; set; } = new();
    }

    public class DebitNotePdfItemDto
    {
        public int DebitNoteItemId { get; set; }

        public int? ProductId { get; set; }

        public string ItemType { get; set; }

        public string Description { get; set; }

        public string HsnSacCode { get; set; }

        public decimal Quantity { get; set; }

        public decimal Rate { get; set; }

        public decimal Amount { get; set; }

        public decimal GstAmount { get; set; }

        public decimal CgstAmount { get; set; }

        public decimal SgstAmount { get; set; }

        public decimal IgstAmount { get; set; }

        public decimal Price { get; set; }
    }
}
