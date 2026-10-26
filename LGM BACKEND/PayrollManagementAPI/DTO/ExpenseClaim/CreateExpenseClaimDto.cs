using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.ExpenseClaim
{
    public class CreateExpenseClaimDto
    {
        [Required]
        public int ExpenseTypeID { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime ClaimDate { get; set; }

        public string? Description { get; set; }

        public IFormFile? ReceiptFile { get; set; }
    }
}
