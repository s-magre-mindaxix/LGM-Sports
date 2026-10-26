using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.LoanApplication
{
    public class LoanStatusUpdateDto
    {
        [Required]
        public string Status { get; set; } 

        [Required]
        public int ApprovedByUserId { get; set; }
    }
}
