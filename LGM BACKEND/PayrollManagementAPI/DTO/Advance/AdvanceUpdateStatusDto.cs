using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.Advance
{
    public class AdvanceUpdateStatusDto
    {
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } 

        [Required]
        public int ProcessedByEmployeeId { get; set; }
    }
}
