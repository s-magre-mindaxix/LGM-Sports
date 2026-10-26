using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Models.Commonmaster;
using CompanyPlatform.Core.Models.CRM.Dashboards;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Invoice
{
    [Table("Tbl_Invoice")]
    public class Invoice
    {
        public int InvoiceId { get; set; }

        public int? OrderAcceptanceId { get; set; }
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

        [Column(TypeName = "decimal(18,2)")]
        public decimal AdvanceAmount { get; set; }

        public bool AdvanceReceived { get; set; }

        [Column(TypeName = "decimal(18,2)")]
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
        public bool IsDeleted { get; set; } = false;
        public ICollection<InvoiceItem> Items { get; set; }
        [ForeignKey("ProductGroupId")]
        public ProductGroup ProductGroup { get; set; }

        public CompanyPlatform.Core.Models.Company Company { get; set; }
        public Vendor Vendor { get; set; }
        public Customer Customer { get; set; }
        public Currency Currency { get; set; }

        [ForeignKey(nameof(ResponsiblePersonId))]
        public CustomerContact ResponsiblePerson { get; set; }   
        public State PlaceOfSupply { get; set; }                
        public CompanyGroup CompanyGroup { get; set; }
        public CompanyBankDetail BankDetail { get; set; }

        [ForeignKey("ServiceId")]
        public ServiceMaster Service { get; set; }

        [ForeignKey("ServiceReportId")] 
        public virtual ServiceReport ServiceReport { get; set; }
    }
}
