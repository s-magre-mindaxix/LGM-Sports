using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("SalarySettingPercentage")]
    public class SalarySettingPercentage
    {
        public int Id { get; set; }
        public string ComponentName { get; set; }

        public decimal? Percentage { get; set; }
        public decimal? FixedAmount { get; set; }

        public string CalculationBase { get; set; }
        public bool IsApplicable { get; set; }

        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
