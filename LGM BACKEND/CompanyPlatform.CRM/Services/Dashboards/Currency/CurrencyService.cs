using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO.Currency;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CompanyPlatform.Core.Models.CRM.Dashboards;

namespace CompanyPlatform.CRM.Services.Dashboards.Currency
{
    public class CurrencyService : ICurrencyService
    {
        private readonly ApplicationDBContext _context;

        public CurrencyService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<CurrencyHistoryResponse>> GetCurrencyHistoryAsync(string code)
        {
            return await _context.Tbl_CurrencyHistory
                .Where(h => h.CurrencyCode == code)
                .OrderByDescending(h => h.CreatedAt)
                .Take(50) // Show last 50 updates
                .Select(h => new CurrencyHistoryResponse
                {
                    Id = h.Id,
                    Date = h.CreatedAt.ToString("dd MMM yyyy"),
                    Time = h.CreatedAt.ToString("hh:mm tt"),
                    Rate = h.Rate
                })
                .ToListAsync();
        }

        public async Task LogCurrencyRateAsync(LogCurrencyRequest request)
        {
            var lastLog = await _context.Tbl_CurrencyHistory
                .Where(h => h.CurrencyCode == request.Code)
                .OrderByDescending(h => h.CreatedAt)
                .FirstOrDefaultAsync();

            bool hasPriceMoved = lastLog != null && Math.Round(lastLog.Rate, 2) != Math.Round(request.Rate, 2);


            if (lastLog == null || (DateTime.UtcNow - lastLog.CreatedAt).TotalHours >= 1 || hasPriceMoved)
            {
                var entry = new CurrencyHistory
                {
                    CurrencyCode = request.Code,
                    Rate = request.Rate,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Tbl_CurrencyHistory.Add(entry);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<CurrencyDto>> GetAllAsync()
        {
            return await _context.Tbl_Currencies
                .Where(x => !x.IsDeleted)
                .Select(x => new CurrencyDto
                {
                    Id = x.Id,
                    CurrencyName = x.CurrencyName,
                    CurrencySymbol = x.CurrencySymbol,
                    CurrencyValue = x.CurrencyValue
                })
                .ToListAsync();
        }

        public async Task<CurrencyDto> CreateAsync(CurrencyDto dto)
        {
            var currency = new Core.Models.CRM.Dashboards.Currency
            {
                CurrencyName = dto.CurrencyName,
                CurrencySymbol = dto.CurrencySymbol,
                CurrencyValue = dto.CurrencyValue
            };
            _context.Tbl_Currencies.Add(currency);
            await _context.SaveChangesAsync();
            dto.Id = currency.Id;
            return dto;
        }

        public async Task<bool> UpdateAsync(CurrencyDto dto)
        {
            var currency = await _context.Tbl_Currencies.FindAsync(dto.Id);
            if (currency == null) return false;

            currency.CurrencyName = dto.CurrencyName;
            currency.CurrencySymbol = dto.CurrencySymbol;
            currency.CurrencyValue = dto.CurrencyValue;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var currency = await _context.Tbl_Currencies.FindAsync(id);
            if (currency == null) return false;
            currency.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        //public async Task<bool> UpdateTodayCurrencyRateAsync(string code, decimal rate)
        //{
        //    code = code.ToUpper();

        //    var indiaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
        //    var indiaNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, indiaTimeZone);

        //    var todayIndia = indiaNow.Date;
        //    var tomorrowIndia = todayIndia.AddDays(1);

        //    var todayStartUtc = TimeZoneInfo.ConvertTimeToUtc(todayIndia, indiaTimeZone);
        //    var tomorrowStartUtc = TimeZoneInfo.ConvertTimeToUtc(tomorrowIndia, indiaTimeZone);

        //    var todayRate = await _context.Tbl_CurrencyHistory
        //        .Where(x =>
        //            x.CurrencyCode == code &&
        //            x.CreatedAt >= todayStartUtc &&
        //            x.CreatedAt < tomorrowStartUtc)
        //        .OrderByDescending(x => x.CreatedAt)
        //        .FirstOrDefaultAsync();

        //    if (todayRate == null)
        //    {
        //        todayRate = new CurrencyHistory
        //        {
        //            CurrencyCode = code,
        //            Rate = rate,
        //            CreatedAt = DateTime.UtcNow
        //        };

        //        _context.Tbl_CurrencyHistory.Add(todayRate);
        //    }
        //    else
        //    {
        //        todayRate.Rate = rate;
        //        // keep same CreatedAt, so history date/time does not duplicate
        //    }

        //    await _context.SaveChangesAsync();
        //    return true;
        //}

        public async Task<bool> UpdateTodayCurrencyRateAsync(string code, decimal rate)
        {
            code = code.ToUpper();

            var indiaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var indiaNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, indiaTimeZone);

            var todayIndia = indiaNow.Date;

            var todayStartUtc = TimeZoneInfo.ConvertTimeToUtc(todayIndia, indiaTimeZone);
            var tomorrow9AmUtc = TimeZoneInfo.ConvertTimeToUtc(todayIndia.AddDays(1).AddHours(9), indiaTimeZone);

            var existingRate = await _context.Tbl_CurrencyHistory
                .Where(x =>
                    x.CurrencyCode == code &&
                    x.CreatedAt >= todayStartUtc &&
                    x.CreatedAt < tomorrow9AmUtc)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();

            if (existingRate == null)
            {
                existingRate = new CurrencyHistory
                {
                    CurrencyCode = code,
                    Rate = rate,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Tbl_CurrencyHistory.Add(existingRate);
            }
            else
            {
                existingRate.Rate = rate;
            }

            await _context.SaveChangesAsync();
            return true;
        }

    }
}
