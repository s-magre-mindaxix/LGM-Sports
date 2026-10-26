namespace PayrollManagementAPI.DTO.TaxCalculation
{
    public class TaxCalculationResultDto
    {
        public decimal TotalIncomeTax { get; set; }
        public decimal RebateUnder87A { get; set; }
        public decimal TaxAfterRebate { get; set; }
        public decimal HealthAndEducationCess { get; set; }
        public decimal TotalTaxLiability { get; set; }
        public List<TaxSlabDetailDto> SlabBreakdown { get; set; } = new List<TaxSlabDetailDto>();

    }

    public class TaxSlabDetailDto
    {
        public string SlabDescription { get; set; }
        public decimal ChargeableAmount { get; set; }
        public string TaxRate { get; set; }
        public decimal TaxAmount { get; set; }
    }
}
