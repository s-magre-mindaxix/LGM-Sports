using CompanyPlatform.CRM.DTO.Currency;
using CompanyPlatform.CRM.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Dashboards.Currency
{
    public interface ICurrencyService
    {
        Task<List<CurrencyHistoryResponse>> GetCurrencyHistoryAsync(string code);
        Task LogCurrencyRateAsync(LogCurrencyRequest request);
        Task<List<CurrencyDto>> GetAllAsync();
        Task<CurrencyDto> CreateAsync(CurrencyDto dto);
        Task<bool> UpdateAsync(CurrencyDto dto);

        Task<bool> UpdateTodayCurrencyRateAsync(string code, decimal rate);
        Task<bool> DeleteAsync(int id);
    }
}
