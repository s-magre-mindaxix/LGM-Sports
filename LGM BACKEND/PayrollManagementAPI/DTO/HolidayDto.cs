using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace PayrollManagementAPI.DTO
{
    public class HolidayDto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [StringLength(100)]
        public string Description { get; set; }

        [Required]
        public int Year { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
