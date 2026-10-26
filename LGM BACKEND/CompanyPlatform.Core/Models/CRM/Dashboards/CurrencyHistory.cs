using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Dashboards
{
    public class CurrencyHistory
    {
        public int Id { get; set; }
        public string CurrencyCode { get; set; }
        public decimal Rate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
