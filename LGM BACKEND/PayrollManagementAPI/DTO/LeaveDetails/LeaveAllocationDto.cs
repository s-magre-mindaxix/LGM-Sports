using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.LeaveDetails
{
    public class LeaveAllocationDto
    {
        [Required]
        public int LeaveTypeID { get; set; }

        [Required]
        [Range(0.5, 365, ErrorMessage = "Allocated days must be between 0.5 and 365.")]
        public decimal AllocatedDays { get; set; }

        [Required]
        public int FinancialYear { get; set; }
    }
}
