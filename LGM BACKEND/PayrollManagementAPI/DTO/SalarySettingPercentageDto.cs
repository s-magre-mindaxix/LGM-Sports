using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO
{
    public class SalarySettingPercentageDto
    {
        public int Id { get; set; }
        public string ComponentName { get; set; }
        public decimal? Percentage { get; set; }
        public decimal? FixedAmount { get; set; }
        public string CalculationBase { get; set; }
        public bool IsApplicable { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class SalarySettingPercentageCreateUpdateDto
    {

        [Required, StringLength(100)]
        public string ComponentName { get; set; }

        public decimal? Percentage { get; set; }
        public decimal? FixedAmount { get; set; }

        [Required]
        public string CalculationBase { get; set; }

        public bool IsApplicable { get; set; }

        [Required]
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }
}
