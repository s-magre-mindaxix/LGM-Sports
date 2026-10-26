using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.LoanApplication
{
    public class LoanApplicationCreateDto
    {
        [Required]
        public int EmployeeId { get; set; }
        public int LoanTypeId { get; set; }

        [Required]
        [Range(1, double.MaxValue, ErrorMessage = "Loan amount must be positive.")]
        public decimal LoanAmount { get; set; }

        [Required]
        [Range(1, 120, ErrorMessage = "Tenure must be between 1 and 120 months.")]
        public int TenureInMonths { get; set; }
    }
}
