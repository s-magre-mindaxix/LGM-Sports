using CompanyPlatform.Core.Models.CRM.Dashboards;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.DummyInvoice
{
    [Table("Tbl_DummyInvoices")]
    public class DummyInvoice
    {
        [Key]
        public int DummyInvoiceId { get; set; }
        [Required]
        public int OriginalProformaInvoiceId { get; set; }
        [Required]
        public string DummyInvoiceNo { get; set; }
        [Required]
        public DateTime DummyInvoiceDate { get; set; }
        [ForeignKey("PurchaseOrder")]
        public int OrderAcceptanceId { get; set; }

        public int? ServiceReportId { get; set; }
        public int GroupId { get; set; }
        public int CompanyId { get; set; }
        public int? VendorId { get; set; }
        public int CompanyGroupId { get; set; }
        public int CustomerId { get; set; }
        public int? ResponsiblePersonId { get; set; }
        public int CurrencyId { get; set; }
        public int PlaceOfSupplyId { get; set; }
        public int BankDetailId { get; set; }
        [MaxLength(100)]
        public string CustomerPO { get; set; }
        public DateTime? CustomerPODate { get; set; }
        [Required]
        public string ConsigneeNameAndAddress { get; set; }
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Subtotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Percentage { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PercentageAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PercentageTaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal BalanceAmount { get; set; }


        [Column(TypeName = "decimal(18, 2)")]
        public decimal FreightOrCarrierInsurance { get; set; }
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalGstAmount { get; set; }
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal GrandTotal { get; set; }
        public string TermsAndConditions { get; set; }
        public string CustomerNotes { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public virtual Customer Customer { get; set; }
        public virtual Currency Currency { get; set; }
        public virtual ICollection<DummyInvoiceItem> Items { get; set; } = new List<DummyInvoiceItem>();
    }
}
