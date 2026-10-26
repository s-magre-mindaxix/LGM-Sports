
using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.TaxCalculation;
using PayrollManagementAPI.Services.TaxCalculation;

namespace PayrollManagementAPI.Services.Tax
{
    public class TaxCalculationService : ITaxCalculationService
    {
        private readonly ApplicationDBContext _context;

        public TaxCalculationService(ApplicationDBContext context)
        {
            _context = context;
        }

        public TaxCalculationResultDto CalculateTax(decimal taxableIncome, string taxRegime, string financialYear)
        {
            var result = new TaxCalculationResultDto();
            const string citizenType = "Regular";

            if (!int.TryParse(financialYear.Split('-')[0], out int startYear))
            {
                throw new ArgumentException("Invalid financial year format.");
            }
            var fyStartDate = new DateTime(startYear, 4, 1);

            // 1. Fetch Tax Slabs
            var slabs = _context.Tbl_TaxSlabs
                .Where(s => s.FinancialYear == financialYear && s.TaxRegime == taxRegime && s.CitizenType == citizenType)
                .OrderBy(s => s.FromAmount)
                .ToList();

            if (!slabs.Any())
                throw new Exception($"Tax slabs not defined for FY {financialYear}, Regime: {taxRegime}");

            // 2. Calculate Gross Tax based on Slabs
            decimal totalTax = 0;
            decimal incomeRemainingForSlab = taxableIncome;

            foreach (var slab in slabs)
            {
                if (incomeRemainingForSlab <= slab.FromAmount) break;

                decimal slabMax = slab.ToAmount ?? decimal.MaxValue;
                decimal taxableInSlab = Math.Min(incomeRemainingForSlab, slabMax) - slab.FromAmount;

                decimal taxForSlab = taxableInSlab * (slab.RatePercentage / 100);
                totalTax += taxForSlab;
            }

            result.TotalIncomeTax = Math.Round(totalTax);

            // --- 3. CORRECTED: Rebate & Cess Logic with exact keys from your DB image ---
            // These keys MUST match your tbl_StatutorySetting -> SettingName column exactly.
            var rebateLimitKey = taxRegime == "New" ? "NewRebateLimit_87A" : "OldRebateLimit_87A";
            var rebateAmountKey = taxRegime == "New" ? "NewRebateAmount_87A" : "OldRebateAmount_87A";

            // Fetch settings that are active for the given financial year
            var allSettings = _context.Tb_StatutorySettings
                .Where(s => s.IsActive && !s.IsDeleted && s.EffectiveDate <= fyStartDate)
                .ToList();

            var rebateLimitSetting = allSettings.Where(s => s.SettingName == rebateLimitKey).OrderByDescending(s => s.EffectiveDate).FirstOrDefault();
            var rebateAmountSetting = allSettings.Where(s => s.SettingName == rebateAmountKey).OrderByDescending(s => s.EffectiveDate).FirstOrDefault();
            var cessRateSetting = allSettings.Where(s => s.SettingName == "CessRate").OrderByDescending(s => s.EffectiveDate).FirstOrDefault();

            if (rebateLimitSetting != null && decimal.TryParse(rebateLimitSetting.SettingValue, out var rebateLimit) &&
                rebateAmountSetting != null && decimal.TryParse(rebateAmountSetting.SettingValue, out var rebateAmount) &&
                cessRateSetting != null && decimal.TryParse(cessRateSetting.SettingValue, out var cessRateValue))
            {
                var cessRate = cessRateValue / 100;

                result.RebateUnder87A = 0; // Default to zero
                if (taxableIncome <= rebateLimit)
                {
                    result.RebateUnder87A = Math.Min(result.TotalIncomeTax, rebateAmount);
                }

                result.TaxAfterRebate = result.TotalIncomeTax - result.RebateUnder87A;
                result.HealthAndEducationCess = Math.Round(result.TaxAfterRebate * cessRate);
                result.TotalTaxLiability = result.TaxAfterRebate + result.HealthAndEducationCess;
            }
            else
            {
                // Fallback if settings are missing for the given year
                result.TaxAfterRebate = result.TotalIncomeTax;
                result.HealthAndEducationCess = 0;
                result.TotalTaxLiability = result.TotalIncomeTax;
            }

            return result;
        }
    }
}