using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace PayrollManagementAPI.DTO
{
    public class StatutorySettingDto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string SettingName { get; set; }

        [Required]
        [StringLength(100)]
        public string SettingValue { get; set; }

        [Required]
        public DateTime? EffectiveDate { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
