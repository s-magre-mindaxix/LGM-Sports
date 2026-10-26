using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO
{
    public class ShiftDto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string ShiftName { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
