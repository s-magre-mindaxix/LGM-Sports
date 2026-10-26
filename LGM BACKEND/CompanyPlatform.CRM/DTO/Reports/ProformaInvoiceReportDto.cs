using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.DTO.Reports
{
    public class ProformaInvoiceReportDto
    {
        public int? GroupId { get; set; }
        public int? CompanyId { get; set; }
        public int? VendorId { get; set; }
        public int? CurrencyId { get; set; }
        public int? PlaceOfSupplyId { get; set; }
        public int? CompanyGroupId { get; set; }
        public int? CustomerId { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class ProformaInvoiceReportResultDto
    {
        public int ProformaInvoiceId { get; set; }

        public string GaxcePurchaseOrderNo { get; set; }
        public string? FinalNote { get; set; }

        public string Group { get; set; }
        public string Company { get; set; }
        public string Vendor { get; set; }

        public string CustomerCompanyGroup { get; set; }
        public string CustomerCompany { get; set; }

        public string CustomerPerson { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerNumber { get; set; }

        public string PlaceOfSupply { get; set; }
        public string Currency { get; set; }

        public decimal TotalAmount { get; set; }

        public DateTime CreatedDate { get; set; }
        public DateTime ExpiryDate { get; set; }
    }

    public class UpdateProformaInvoiceFinalNoteDto
    {
        public int ProformaInvoiceId { get; set; }
        public string? FinalNote { get; set; }
    }
}
