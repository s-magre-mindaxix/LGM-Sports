using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_StatutorySetting")]
    public class StatutorySetting
    {
        [Key]
        public int Id { get; set; }

        [StringLength(100)]
        public string SettingName { get; set; } // e.g., "PF_Employee_Rate", "ESIC_Wage_Ceiling"

        [StringLength(255)]
        public string SettingValue { get; set; }

        public string? Description { get; set; }

        public DateTime? EffectiveDate { get; set; }

        public bool IsActive { get; set; } = true;

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
