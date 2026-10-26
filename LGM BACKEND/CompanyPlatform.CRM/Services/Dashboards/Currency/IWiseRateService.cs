using CompanyPlatform.CRM.DTO.Currency;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Dashboards.Currency
{
    public interface IWiseRateService
    {
        Task<WiseRateDto?> GetRateAsync(string source, string target);
        Task<decimal> GetLockedRateForTodayAsync(string source, string target);
    }
}
