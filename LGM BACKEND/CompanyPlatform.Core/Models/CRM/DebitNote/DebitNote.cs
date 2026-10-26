using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.DebitNote
{
    [Table("Tbl_DebitNote")]
    public class DebitNote
    {
        [Key]
        public int DebitNoteId { get; set; }

        public string DebitNoteNo { get; set; }

        public DateTime DebitNoteDate { get; set; }

        // Invoice Details
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

        // Debit Note Specific

        public decimal DebitNoteAmount { get; set; }

        public decimal AdjustAmount { get; set; }

        public decimal UpdatedBalanceAmount { get; set; }

        public string DebitReason { get; set; }

        public bool IsDeleted { get; set; }

        public virtual ICollection<DebitNoteItem> Items { get; set; }
    }
}
