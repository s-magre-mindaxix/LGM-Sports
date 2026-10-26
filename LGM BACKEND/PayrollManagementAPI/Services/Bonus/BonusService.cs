using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models;

namespace PayrollManagementAPI.Services.Bonus
{
    public class BonusService : IBonusService
    {
        private readonly ApplicationDBContext _context;

        public BonusService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<List<BonusRecord>> GetBonusRecordsForYear(string financialYear)
        {
            return await _context.Tbl_BonusRecords
                                 .Include(b => b.Employee)
                                 .Where(b => b.FinancialYear == financialYear)
                                 .ToListAsync();
        }


        //public async Task<bool> ProcessAnnualBonus(string financialYear)
        //{
        //    var fyStartYear = int.Parse(financialYear.Split('-')[0]);
        //    var fyStartDate = new DateTime(fyStartYear, 4, 1);
        //    var fyEndDate = new DateTime(fyStartYear + 1, 3, 31);

        //    var activeEmployees = await _context.Employees.Where(e => e.IsActive && !e.IsDeleted).ToListAsync();


        //    foreach (var employee in activeEmployees)
        //    {
        //        if (employee.DateOfJoining == null) continue;

        //        if (employee.DateOfJoining.Value > fyEndDate)
        //        {
        //            continue;
        //        }

        //        DateTime effectiveStartDate = employee.DateOfJoining.Value > fyStartDate
        //                                      ? employee.DateOfJoining.Value
        //                                      : fyStartDate;

        //        int tenureInDays = (int)(fyEndDate - effectiveStartDate).TotalDays + 1;

        //        decimal calculatedBonus = 0;
        //        string appliedRule = "Not Eligible";
        //        decimal eligibleSalaryBase = 0;


        //        decimal currentGrossSalary = await _context.Tb_SalaryStructures
        //            .Where(ss => ss.EmployeeID == employee.ID && ss.SalaryComponent.ComponentType == "Earning" && !ss.IsDeleted)
        //            .SumAsync(ss => ss.Amount);

        //        if (currentGrossSalary > 0)
        //        {
        //            if (tenureInDays >= 365)
        //            {
        //                calculatedBonus = currentGrossSalary;
        //                eligibleSalaryBase = currentGrossSalary;
        //                appliedRule = "Full Year Rule";
        //            }
        //            else if (tenureInDays >= 180)
        //            {
        //                calculatedBonus = currentGrossSalary * 0.0833m;
        //                eligibleSalaryBase = currentGrossSalary;
        //                appliedRule = "Half Year Rule";
        //            }
        //        }

        //        // Create or Update the Bonus Record
        //        var existingRecord = await _context.Tbl_BonusRecords
        //            .FirstOrDefaultAsync(b => b.EmployeeID == employee.ID && b.FinancialYear == financialYear);

        //        if (existingRecord != null)
        //        {
        //            // Update existing record
        //            existingRecord.BonusAmount = calculatedBonus;
        //            existingRecord.AppliedRule = appliedRule;
        //            existingRecord.TenureInDays = tenureInDays;
        //            existingRecord.EligibleSalaryForCalculation = eligibleSalaryBase;
        //            existingRecord.CalculationDate = DateTime.UtcNow;
        //            existingRecord.Status = "Calculated";
        //        }
        //        else
        //        {
        //            // Create a new record
        //            var newRecord = new BonusRecord
        //            {
        //                EmployeeID = employee.ID,
        //                FinancialYear = financialYear,
        //                BonusAmount = calculatedBonus,
        //                AppliedRule = appliedRule,
        //                TenureInDays = tenureInDays,
        //                EligibleSalaryForCalculation = eligibleSalaryBase,
        //                CalculationDate = DateTime.UtcNow,
        //                Status = "Calculated"
        //            };
        //            _context.Tbl_BonusRecords.Add(newRecord);
        //        }
        //    }

        //    await _context.SaveChangesAsync();
        //    return true;
        //}

        public async Task<bool> ProcessAnnualBonus(string financialYear)
        {
            // --- NO CHANGE HERE: Financial year logic is already correct for April-March ---
            var fyStartYear = int.Parse(financialYear.Split('-')[0]);
            var fyStartDate = new DateTime(fyStartYear, 4, 1);
            var fyEndDate = new DateTime(fyStartYear + 1, 3, 31);

            // Total days in the financial year for pro-rata calculation
            double totalDaysInFY = (fyEndDate - fyStartDate).TotalDays + 1;

            // --- CHANGE 1: Define minimum tenure as a constant for clarity ---
            const int MINIMUM_TENURE_DAYS_FOR_BONUS = 180;

            var activeEmployees = await _context.Employees
                .Where(e => e.IsActive && !e.IsDeleted)
                .ToListAsync();

            foreach (var employee in activeEmployees)
            {
                if (employee.DateOfJoining == null || employee.DateOfJoining.Value > fyEndDate)
                {
                    continue; // Skip employees who joined after the financial year ended
                }

                DateTime effectiveStartDate = employee.DateOfJoining.Value > fyStartDate
                                                ? employee.DateOfJoining.Value
                                                : fyStartDate;

                int tenureInDays = (int)(fyEndDate - effectiveStartDate).TotalDays + 1;

                decimal calculatedBonus = 0;
                string appliedRule = "Not Eligible - Insufficient Tenure";
                decimal eligibleSalaryBase = 0;

                // Fetch current monthly gross salary from salary structure
                decimal currentGrossSalary = await _context.Tb_SalaryStructures
                    .Where(ss => ss.EmployeeID == employee.ID && ss.SalaryComponent.ComponentType == "Earning" && !ss.IsDeleted)
                    .SumAsync(ss => ss.Amount);

                // --- CHANGE 2: Simplified and corrected pro-rata bonus logic ---
                if (currentGrossSalary > 0 && tenureInDays >= MINIMUM_TENURE_DAYS_FOR_BONUS)
                {
                    // Calculate bonus based on the proportion of the year worked
                    calculatedBonus = currentGrossSalary * ((decimal)tenureInDays / (decimal)totalDaysInFY);

                    eligibleSalaryBase = currentGrossSalary;
                    appliedRule = $"Pro-rata Calculation ({tenureInDays}/{totalDaysInFY} days)";
                }

                // Create or Update the Bonus Record (No change in this logic)
                var existingRecord = await _context.Tbl_BonusRecords
                    .FirstOrDefaultAsync(b => b.EmployeeID == employee.ID && b.FinancialYear == financialYear && b.AppliedRule.Contains("Pro-rata")); // Be more specific to avoid overwriting Diwali bonus

                if (existingRecord != null)
                {
                    existingRecord.BonusAmount = calculatedBonus;
                    existingRecord.AppliedRule = appliedRule;
                    existingRecord.TenureInDays = tenureInDays;
                    existingRecord.EligibleSalaryForCalculation = eligibleSalaryBase;
                    existingRecord.CalculationDate = DateTime.UtcNow;
                    existingRecord.Status = "Calculated";
                }
                else
                {
                    var newRecord = new BonusRecord
                    {
                        EmployeeID = employee.ID,
                        FinancialYear = financialYear,
                        BonusAmount = calculatedBonus,
                        AppliedRule = appliedRule,
                        TenureInDays = tenureInDays,
                        EligibleSalaryForCalculation = eligibleSalaryBase,
                        CalculationDate = DateTime.UtcNow,
                        Status = "Calculated"
                    };
                    _context.Tbl_BonusRecords.Add(newRecord);
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }


        // ===================================================================================
        // === METHOD 2 (NEW): For Diwali Bonus (50% of Gross Salary) ===
        // ===================================================================================
        public async Task<bool> ProcessDiwaliBonus(string financialYear)
        {
            var activeEmployees = await _context.Employees
                .Where(e => e.IsActive && !e.IsDeleted)
                .ToListAsync();

            foreach (var employee in activeEmployees)
            {
                // Fetch current monthly gross salary from salary structure
                decimal currentGrossSalary = await _context.Tb_SalaryStructures
                    .Where(ss => ss.EmployeeID == employee.ID && ss.SalaryComponent.ComponentType == "Earning" && !ss.IsDeleted)
                    .SumAsync(ss => ss.Amount);

                if (currentGrossSalary <= 0)
                {
                    continue; // Skip if no salary is defined
                }

                // --- MAIN LOGIC: Calculate 50% of gross salary ---
                decimal diwaliBonusAmount = currentGrossSalary * 0.50m;
                string rule = "Diwali Bonus (50% of Gross)";

                // Create or Update the Bonus Record for Diwali
                var existingRecord = await _context.Tbl_BonusRecords
                    .FirstOrDefaultAsync(b => b.EmployeeID == employee.ID && b.FinancialYear == financialYear && b.AppliedRule.Contains("Diwali"));

                if (existingRecord != null)
                {
                    existingRecord.BonusAmount = diwaliBonusAmount;
                    existingRecord.EligibleSalaryForCalculation = currentGrossSalary;
                    existingRecord.CalculationDate = DateTime.UtcNow;
                    existingRecord.Status = "Calculated";
                    // Keep the AppliedRule and TenureInDays as they were
                }
                else
                {
                    var newRecord = new BonusRecord
                    {
                        EmployeeID = employee.ID,
                        FinancialYear = financialYear,
                        BonusAmount = diwaliBonusAmount,
                        AppliedRule = rule,
                        TenureInDays = 0, // Tenure is not applicable for this bonus type
                        EligibleSalaryForCalculation = currentGrossSalary,
                        CalculationDate = DateTime.UtcNow,
                        Status = "Calculated"
                    };
                    _context.Tbl_BonusRecords.Add(newRecord);
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BonusRecord> GetMyBonusRecordForYear(int employeeId, string financialYear)
        {
            return await _context.Tbl_BonusRecords
                                 .Include(b => b.Employee) // Still useful to have employee details
                                 .FirstOrDefaultAsync(b => b.EmployeeID == employeeId && b.FinancialYear == financialYear);
        }
    }
}
