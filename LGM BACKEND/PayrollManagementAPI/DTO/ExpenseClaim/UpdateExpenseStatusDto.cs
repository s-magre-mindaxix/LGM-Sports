using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.ExpenseClaim
{
    public class UpdateExpenseStatusDto
    {
        [Required]
        public string Status { get; set; } 

        public string? ManagerRemarks { get; set; }

        public decimal? ApprovedAmount { get; set; }
    }
}
