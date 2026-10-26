using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.DTO.CreditNote
{
    public class CreditNoteDto
    {
        public int CreditNoteId { get; set; }

        public string CreditNoteNo { get; set; }

        public DateTime CreditNoteDate { get; set; }

        public int InvoiceId { get; set; }

        public string InvoiceNo { get; set; }

        public DateTime InvoiceDate { get; set; }

        public decimal CreditNoteAmount { get; set; }

        public string CreditNoteAmountInWords { get; set; }

        public string CreditReason { get; set; }

        // Company
        public string CompanyName { get; set; }

        public string CompanyAddress { get; set; }

        public string CompanyGstin { get; set; }

        public string CompanyPan { get; set; }

        public string Range { get; set; }

        public string Division { get; set; }

        public string Commissionerate { get; set; }

        // Buyer
        public string CustomerName { get; set; }

        public string BuyerGstin { get; set; }

        public string BuyerState { get; set; }

        public string BuyerStateCode { get; set; }

        public string PlaceOfSupply { get; set; }

        public string CustomerPo { get; set; }

        public DateTime CompanyPoDate { get; set; }

        // Service
        public string SacCode { get; set; }

        public string TaxableServiceDescription { get; set; }

        // Other
        public string VendorName { get; set; }

        public string CurrencyName { get; set; }

        public string CurrencySymbol { get; set; }

        public string BankName { get; set; }

        public string AccountNo { get; set; }

        public string Ifsc { get; set; }

        public string ConsigneeNameAddress { get; set; }

        public string TermsConditions { get; set; }

        // Financial
        public decimal SubTotal { get; set; }

        public decimal FreightCharges { get; set; }

        public decimal GrandTotal { get; set; }

        public decimal TotalCgst { get; set; }

        public decimal TotalSgst { get; set; }

        public decimal RemainingBalanceAmount { get; set; }

        public decimal AdvanceAmount { get; set; }

        public decimal BalanceAmount { get; set; }

        public string GrandTotalInWords { get; set; }

        public string CustomerAddress { get; set; }

        public List<CreditNoteItemDto> Items { get; set; }
    }

    public class CreditNoteItemDto
    {
        public int CreditNoteItemId { get; set; }

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

    public class CreditNoteListDto
    {
        public int CreditNoteId { get; set; }

        public string CreditNoteNo { get; set; }

        public DateTime CreditNoteDate { get; set; }

        public string InvoiceNo { get; set; }

        public decimal CreditNoteAmount { get; set; }

        public decimal RemainingBalanceAmount { get; set; }

        public string CreditReason { get; set; }
    }

    public class CreateCreditNoteDto
    {
        public int InvoiceId { get; set; }

        public string CreditNoteNo { get; set; }

        public decimal CreditNoteAmount { get; set; }

        public string CreditReason { get; set; }
    }

    public class InvoiceDropdownDto
    {
        public int InvoiceId { get; set; }

        public string InvoiceNo { get; set; }
    }
}
