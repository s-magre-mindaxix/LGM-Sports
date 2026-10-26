using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Models.Commonmaster;
using CompanyPlatform.Core.Models.CRM.Dashboards;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_ProformaInvoices")]
    public class ProformaInvoice
    {
        [Key]
        public int ProformaInvoiceId { get; set; }

        [Required]
        public string ProformaInvoiceNo { get; set; } // Auto-Generated

        [Required]
        public DateTime ProformaInvoiceDate { get; set; }

        [Required]
        public DateTime ProformaInvoiceExpiryDate { get; set; }

        public string? FinalNote { get; set; }

        // --- Foreign Keys for Dropdowns ---
        [ForeignKey("PurchaseOrder")]
        public int OrderAcceptanceId { get; set; }

        [ForeignKey("ServiceReport")]
        public int? ServiceReportId { get; set; }


        [ForeignKey("ProductGroup")]
        public int GroupId { get; set; }

        [ForeignKey("Company")]
        public int CompanyId { get; set; }

        [ForeignKey("Vendor")]
        public int? VendorId { get; set; } // Nullable if not always required

        [ForeignKey("CompanyGroup")]
        public int CompanyGroupId { get; set; }

        [ForeignKey("Customer")]
        public int CustomerId { get; set; }

        [ForeignKey("CustomerContact")]
        public int? ResponsiblePersonId { get; set; }

        [ForeignKey("Currency")]
        public int CurrencyId { get; set; }

        public int PlaceOfSupplyId { get; set; }

        [ForeignKey("BankDetail")]
        public int BankDetailId { get; set; }


        // --- Customer PO Details ---
        [MaxLength(100)]
        public string CustomerPO { get; set; }
        public DateTime? CustomerPODate { get; set; }


        // --- Consignee Details ---
        [Required]
        public string ConsigneeNameAndAddress { get; set; }


        // --- Financial Totals ---
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


        // --- Additional Information ---
        public string TermsAndConditions { get; set; }
        public string CustomerNotes { get; set; }


        // --- System & Status Fields ---
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;


        // --- Navigation Properties ---
        public virtual OrderAcceptance OrderAcceptance { get; set; }

        public virtual ServiceReport? ServiceReport { get; set; }
        public virtual ProductGroup ProductGroup { get; set; }
        public virtual CompanyPlatform.Core.Models.Company Company { get; set; }
        public virtual Vendor Vendor { get; set; }
        public virtual CompanyGroup CompanyGroup { get; set; }
        public virtual Customer Customer { get; set; }

        public virtual CustomerContact CustomerContact { get; set; }
        public virtual Currency Currency { get; set; }

        [ForeignKey("PlaceOfSupplyId")]
        public virtual State PlaceOfSupply { get; set; }

        public virtual ICollection<ProformaInvoiceItem> Items { get; set; } = new List<ProformaInvoiceItem>();
    }
}
