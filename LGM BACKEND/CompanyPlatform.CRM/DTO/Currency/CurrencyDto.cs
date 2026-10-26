using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.DTO.Currency
{
    public class CurrencyDto
    {
        public int Id { get; set; }
        public string CurrencyName { get; set; }
        public string CurrencySymbol { get; set; }
        public decimal CurrencyValue { get; set; }
    }
}
