using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.OutdoorDuty
{
    public class UpdateODStatusDto
    {
        [Required]
        [StringLength(50)]
        public string Status { get; set; }

        [StringLength(500)]
        public string? ManagerRemarks { get; set; }
    }
}
