using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.DTO.Currency
{
    public class WiseRateDto
    {
        public decimal Rate { get; set; }
        public string Source { get; set; } = "";
        public string Target { get; set; } = "";
        public string Time { get; set; } = "";
    }
}
