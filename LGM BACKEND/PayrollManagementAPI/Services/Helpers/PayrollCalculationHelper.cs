using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models;
using System.Collections.Generic;
using System.Linq;

namespace PayrollManagementAPI.Helpers
{
    public static class PayrollCalculationHelper
    {
        public static (decimal employeePF, decimal employerPF) CalculateProvidentFund(decimal grossSalary, decimal basicSalary, Dictionary<string, string> settings, decimal? employeeSpecificRate, bool isCapped)
        {
            // Get PF threshold and rates from statutory settings, with safe fallbacks
            decimal pfThreshold = decimal.TryParse(settings.GetValueOrDefault("PF_Threshold"), out var th) ? th : 15000m;
            decimal rateBelowThreshold = decimal.TryParse(settings.GetValueOrDefault("PF_Rate_Below_Threshold"), out var rbt) ? rbt : 12.0m;
            decimal employerFixedContribution = decimal.TryParse(settings.GetValueOrDefault("PF_Employer_Contribution_Fixed"), out var efc) ? efc : 1800m;

            if (grossSalary <= pfThreshold)
            {
                decimal pfAmount = basicSalary * (rateBelowThreshold / 100m);
                return (pfAmount, pfAmount);
            }
            else
            {
                decimal employeeRate = employeeSpecificRate ?? 12.0m;
                decimal empPF;

                if (isCapped)
                {
                    empPF = employerFixedContribution;
                }
                else
                {
                    empPF = basicSalary * (employeeRate / 100m);
                }

                // The employer's contribution is always fixed for salaries above the threshold.
                return (empPF, employerFixedContribution);
            }
        }

        //public static decimal CalculateProfessionalTax(decimal grossSalary, string gender, List<ProfessionalTaxSlab> slabs)
        //{
        //    if (string.IsNullOrWhiteSpace(gender) || slabs == null || !slabs.Any())
        //    {
        //        return 0m;
        //    }

        //    var applicableSlab = slabs
        //        .Where(s =>
        //            s.Gender.Trim().Equals(gender.Trim(), System.StringComparison.OrdinalIgnoreCase) &&
        //            grossSalary >= s.MinGrossSalary &&
        //            (s.MaxGrossSalary == null || grossSalary <= s.MaxGrossSalary)
        //        )
        //        .FirstOrDefault();

        //    return applicableSlab?.TaxAmount ?? 0m;
        //}

        public static decimal CalculateESIC(decimal grossSalary, Dictionary<string, string> settings)
        {
            decimal esicThreshold = decimal.TryParse(settings.GetValueOrDefault("ESIC_Threshold"), out var th) ? th : 21000m;
            decimal esicRate = decimal.TryParse(settings.GetValueOrDefault("ESIC_Rate_Employee"), out var rate) ? rate : 0.75m;

            if (grossSalary > 0 && grossSalary <= esicThreshold)
            {
                return grossSalary * (esicRate / 100m);
            }

            return 0m;
        }

        public static decimal CalculateIncomeTax(
            int employeeId,
            string financialYear,
            decimal annualGrossSalary,
            Dictionary<string, string> statutorySettings,
            List<TaxSlab> allTaxSlabsForYear,
            ApplicationDBContext context)
        {
            var declaration = context.Tbl_EmployeeTaxDeclarations
                .Include(d => d.DeclarationDetails)
                .FirstOrDefault(d => d.EmployeeID == employeeId &&
                                     d.FinancialYear == financialYear &&
                                     d.Status != "Draft");

            string regime = declaration?.TaxRegime ?? "New"; 
            decimal taxableIncome = annualGrossSalary;

            // Apply Standard Deduction for both regimes as per the new rules.
            decimal standardDeduction = decimal.TryParse(statutorySettings.GetValueOrDefault("TDS Standard Deduction"), out var sd) ? sd : 75000m;
            taxableIncome -= standardDeduction;

            if (regime == "Old")
            {
                if (declaration != null)
                {
                    decimal totalDeclaredDeductions = declaration.DeclarationDetails.Sum(detail => detail.ApprovedAmount ?? detail.DeclaredAmount);
                    taxableIncome -= totalDeclaredDeductions;
                }
            }
            else // New Regime
            {
                if (declaration != null)
                {
                    var employerNpsDeduction = declaration.DeclarationDetails.FirstOrDefault(d => d.Section == "80CCD(2)");
                    if (employerNpsDeduction != null)
                    {
                        taxableIncome -= (employerNpsDeduction.ApprovedAmount ?? employerNpsDeduction.DeclaredAmount);
                    }
                }
            }

            taxableIncome = Math.Max(0, taxableIncome);

            decimal grossAnnualTax = CalculateTaxOnAmount(taxableIncome, allTaxSlabsForYear, regime);


            // STEP 3: Apply Rebate under Section 87A
            decimal taxAfterRebate = grossAnnualTax;
            if (grossAnnualTax > 0)
            {
                decimal rebateLimit = (regime == "Old")
                    ? (decimal.TryParse(statutorySettings.GetValueOrDefault("OldRebateLimit87A"), out var oldRl) ? oldRl : 500000m)
                    : (decimal.TryParse(statutorySettings.GetValueOrDefault("NewRebateLimit87A"), out var newRl) ? newRl : 1200000m);

                decimal rebateAmount = (regime == "Old")
                    ? (decimal.TryParse(statutorySettings.GetValueOrDefault("OldRebateAmount87A"), out var oldRa) ? oldRa : 12500m)
                    : (decimal.TryParse(statutorySettings.GetValueOrDefault("NewRebateAmount87A"), out var newRa) ? newRa : 60000m);

                if (taxableIncome <= rebateLimit)
                {
                    // Rebate is the lesser of the calculated tax or the maximum rebate amount.
                    decimal applicableRebate = Math.Min(grossAnnualTax, rebateAmount);
                    taxAfterRebate -= applicableRebate;
                }
            }

            // STEP 4: Calculate Health & Education Cess on the remaining tax
            decimal cessRate = decimal.TryParse(statutorySettings.GetValueOrDefault("CessRate"), out var cr) ? cr : 4.0m;
            decimal cessAmount = taxAfterRebate * (cessRate / 100m);

            // STEP 5: Calculate Final Annual Tax
            decimal finalAnnualTax = taxAfterRebate + cessAmount;
            // ===================== END OF NEW LOGIC =====================

            // STEP 6: Return the monthly TDS amount
            return Math.Ceiling(finalAnnualTax / 12);
        }


        private static decimal CalculateTaxOnAmount(decimal taxableIncome, List<TaxSlab> allSlabs, string regime)
        {
            var applicableSlabs = allSlabs
                .Where(s => s.TaxRegime == regime)
                .OrderBy(s => s.FromAmount)
                .ToList();

            if (!applicableSlabs.Any()) return 0;

            decimal totalTax = 0;

            foreach (var slab in applicableSlabs)
            {
                // Check if the income is above the starting point of the current slab
                if (taxableIncome > slab.FromAmount)
                {
                    // Determine the maximum amount for this slab (infinity if it's the last slab)
                    decimal slabUpperBound = slab.ToAmount ?? decimal.MaxValue;

                    // Calculate the amount of income that falls *within* this specific slab's range
                    decimal amountInThisSlab = Math.Min(taxableIncome, slabUpperBound) - slab.FromAmount;

                    // Calculate the tax for ONLY that portion of income and add it to the total
                    totalTax += amountInThisSlab * (slab.RatePercentage / 100m);
                }
            }
            return totalTax;
        }

        public static decimal CalculateProfessionalTax(decimal grossSalary, string gender, List<ProfessionalTaxSlab> slabs, int month)
        {
            if (string.IsNullOrWhiteSpace(gender))
            {
                return 0m;
            }

            // --- CHANGE 2: Add special logic for February (month == 2) ---
            if (month == 2)
            {
                // For February, PT is fixed based on gender, overriding the slabs.
                if (gender.Trim().Equals("Female", StringComparison.OrdinalIgnoreCase))
                {
                    return 300m;
                }
                else if (gender.Trim().Equals("Male", StringComparison.OrdinalIgnoreCase))
                {
                    return 250m;
                }
                else
                {
                    // If gender is not Male/Female, return 0 for Feb.
                    return 0m;
                }
            }

            // --- For all other months, use the existing slab logic ---
            if (slabs == null || !slabs.Any())
            {
                return 0m;
            }

            var applicableSlab = slabs
                .Where(s =>
                    s.Gender.Trim().Equals(gender.Trim(), System.StringComparison.OrdinalIgnoreCase) &&
                    grossSalary >= s.MinGrossSalary &&
                    (s.MaxGrossSalary == null || grossSalary <= s.MaxGrossSalary)
                )
                .FirstOrDefault();

            return applicableSlab?.TaxAmount ?? 0m;
        }
    }
}