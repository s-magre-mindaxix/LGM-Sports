using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.CreditNote
{
    [Table("Tbl_CreditNote")]
    public class CreditNote
    {
        [Key]
        public int CreditNoteId { get; set; }

        public string CreditNoteNo { get; set; }

        public DateTime CreditNoteDate { get; set; }

        // Linked Invoice
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

        public decimal AdvanceAmount { get; set; }

        public bool AdvanceReceived { get; set; }

        public decimal BalanceAmount { get; set; }

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

        public string? FinalNote { get; set; }

        // Credit Note Specific

        public decimal CreditNoteAmount { get; set; }

        public decimal RemainingBalanceAmount { get; set; }

        public string CreditReason { get; set; }

        public bool IsDeleted { get; set; }

        public virtual ICollection<CreditNoteItem> Items { get; set; }
    }
}
