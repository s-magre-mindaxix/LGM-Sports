using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.DTO.Dashboard
{
    public class CrmDashboardStatsDto
    {
        public int Companies { get; set; }
        public int Employees { get; set; }
        public int Vendors { get; set; }
        public int Customers { get; set; }
        public int Products { get; set; }
        public int Accessories { get; set; }
        public int Enquiries { get; set; }
        public int Offers { get; set; }
        public int OrderAcceptances { get; set; }
        public int ProformaInvoices { get; set; }
        public int Invoices { get; set; }
    }
}
