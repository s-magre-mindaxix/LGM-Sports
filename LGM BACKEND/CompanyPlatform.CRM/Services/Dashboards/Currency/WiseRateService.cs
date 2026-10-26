using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM.Dashboards;
using CompanyPlatform.CRM.DTO.Currency;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Dashboards.Currency
{
    public class WiseRateService : IWiseRateService
    {
        private readonly HttpClient _httpClient;
        private readonly WiseSettings _settings;
        private readonly ApplicationDBContext _context;

        public WiseRateService(
            HttpClient httpClient,
            IOptions<WiseSettings> settings,
            ApplicationDBContext context)
        {
            _httpClient = httpClient;
            _settings = settings.Value;
            _context = context;
        }

        public async Task<WiseRateDto?> GetRateAsync(string source, string target)
        {
            var request = new HttpRequestMessage(
                HttpMethod.Get,
                $"{_settings.BaseUrl}/v1/rates?source={source}&target={target}"
            );

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", _settings.ApiToken);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var rates = JsonSerializer.Deserialize<List<WiseRateDto>>(json, options);

            return rates?.FirstOrDefault();
        }

        //public async Task<decimal> GetLockedRateForTodayAsync(string source, string target)
        //{
        //    source = source.ToUpper();
        //    target = target.ToUpper();

        //    if (target != "INR")
        //        throw new Exception("Currently only INR target is supported.");

        //    var indiaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
        //    var indiaNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, indiaTimeZone);
        //    var todayIndia = indiaNow.Date;
        //    var tomorrowIndia = todayIndia.AddDays(1);

        //    var todayStartUtc = TimeZoneInfo.ConvertTimeToUtc(todayIndia, indiaTimeZone);
        //    var tomorrowStartUtc = TimeZoneInfo.ConvertTimeToUtc(tomorrowIndia, indiaTimeZone);

        //    var existingRate = await _context.Set<CurrencyHistory>()
        //        .Where(x =>
        //            x.CurrencyCode == source &&
        //            x.CreatedAt >= todayStartUtc &&
        //            x.CreatedAt < tomorrowStartUtc)
        //        .OrderByDescending(x => x.CreatedAt)
        //        .FirstOrDefaultAsync();

        //    if (existingRate != null)
        //        return existingRate.Rate;

        //    var wiseRate = await GetRateAsync(source, target);

        //    if (wiseRate == null || wiseRate.Rate <= 0)
        //        throw new Exception($"Wise rate not found for {source} to {target}.");

        //    var newRate = new CurrencyHistory
        //    {
        //        CurrencyCode = source,
        //        Rate = wiseRate.Rate,
        //        CreatedAt = DateTime.UtcNow
        //    };

        //    _context.Set<CurrencyHistory>().Add(newRate);
        //    await _context.SaveChangesAsync();

        //    return newRate.Rate;
        //}

        public async Task<decimal> GetLockedRateForTodayAsync(string source, string target)
        {
            source = source.ToUpper();
            target = target.ToUpper();

            if (target != "INR")
                throw new Exception("Currently only INR target is supported.");

            var indiaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var indiaNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, indiaTimeZone);

            var todayIndia = indiaNow.Date;
            var today9AmIndia = todayIndia.AddHours(9);

            var todayStartUtc = TimeZoneInfo.ConvertTimeToUtc(todayIndia, indiaTimeZone);
            var tomorrow9AmUtc = TimeZoneInfo.ConvertTimeToUtc(todayIndia.AddDays(1).AddHours(9), indiaTimeZone);

            var yesterdayStartUtc = TimeZoneInfo.ConvertTimeToUtc(todayIndia.AddDays(-1), indiaTimeZone);
            var today9AmUtc = TimeZoneInfo.ConvertTimeToUtc(today9AmIndia, indiaTimeZone);

            IQueryable<CurrencyHistory> query;

            if (indiaNow < today9AmIndia)
            {
                query = _context.Set<CurrencyHistory>()
                    .Where(x =>
                        x.CurrencyCode == source &&
                        x.CreatedAt >= yesterdayStartUtc &&
                        x.CreatedAt < today9AmUtc);
            }
            else
            {
                query = _context.Set<CurrencyHistory>()
                    .Where(x =>
                        x.CurrencyCode == source &&
                        x.CreatedAt >= todayStartUtc &&
                        x.CreatedAt < tomorrow9AmUtc);
            }

            var existingRate = await query
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();

            if (existingRate != null)
                return existingRate.Rate;

            var wiseRate = await GetRateAsync(source, target);

            if (wiseRate == null || wiseRate.Rate <= 0)
                throw new Exception($"Wise rate not found for {source} to {target}.");

            var newRate = new CurrencyHistory
            {
                CurrencyCode = source,
                Rate = wiseRate.Rate,
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<CurrencyHistory>().Add(newRate);
            await _context.SaveChangesAsync();

            return newRate.Rate;
        }


    }
}
