using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Models.CRM.Dashboards;
//using CompanyPlatform.Core.Models.CRM.Dashboards;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.FinalDummyInvoice
{
    [Table("Tbl_FinalDummyInvoices")]
    public class FinalDummyInvoice
    {
        [Key]
        public int FinalDummyInvoiceId { get; set; }
        [Required]
        public int OriginalInvoiceId { get; set; } // Reference to the original Invoice
        [Required]
        public string FinalDummyInvoiceNo { get; set; }
        [Required]
        public DateTime FinalDummyInvoiceDate { get; set; }

        public string CustomerPo { get; set; }
        public DateTime? CompanyPoDate { get; set; } // Renamed to match Invoice model
        [Required]
        public string ConsigneeNameAddress { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal SubTotal { get; set; }
        [Column(TypeName = "decimal(18, 2)")]
        public decimal FreightCharges { get; set; }
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalGstAmount { get; set; } // Added for consistency
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal GrandTotal { get; set; }

        public bool AdvanceReceived { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal AdvanceAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal BalanceAmount { get; set; }

        public int ProductGroupId { get; set; }
        public int CompanyId { get; set; }
        public int? VendorId { get; set; } // Changed to nullable to match Invoice
        public int CustomerId { get; set; }
        public int CompanyGroupId { get; set; }
        public int? ResponsiblePersonId { get; set; }
        public int CurrencyId { get; set; }
        public int PlaceOfSupplyId { get; set; }
        public int BankDetailId { get; set; }

        public string TermsConditions { get; set; }
        public string CustomerNotes { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        // Navigation Properties

        [ForeignKey("CompanyId")]
        public virtual CompanyPlatform.Core.Models.Company Company { get; set; }

        [ForeignKey("VendorId")]
        public virtual Vendor Vendor { get; set; }

        [ForeignKey("CustomerId")]
        public virtual Customer Customer { get; set; }

        [ForeignKey("CurrencyId")]
        public virtual Currency Currency { get; set; }

        [ForeignKey("PlaceOfSupplyId")]
        public virtual State PlaceOfSupply { get; set; }
        public virtual ICollection<FinalDummyInvoiceItem> Items { get; set; } = new List<FinalDummyInvoiceItem>();
    }
}
