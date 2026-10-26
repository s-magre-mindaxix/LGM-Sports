using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.OutdoorDuty
{
    public class CreateOutdoorDutyDto
    {
        [Required]
        public DateTime FromDate { get; set; }

        [Required]
        public DateTime ToDate { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; }
    }
}
