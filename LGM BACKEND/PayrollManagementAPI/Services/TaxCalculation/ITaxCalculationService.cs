using PayrollManagementAPI.DTO.TaxCalculation;

namespace PayrollManagementAPI.Services.TaxCalculation
{
    public interface ITaxCalculationService
    {
        TaxCalculationResultDto CalculateTax(decimal taxableIncome, string taxRegime, string financialYear);
    }
}
