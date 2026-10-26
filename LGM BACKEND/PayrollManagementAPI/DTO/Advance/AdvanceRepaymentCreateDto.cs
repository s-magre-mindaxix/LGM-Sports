using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.Advance
{
    public class AdvanceRepaymentCreateDto
    {
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal RepaymentAmount { get; set; }

        [Required]
        public DateTime RepaymentDate { get; set; }

        public string Notes { get; set; }

        [Required]
        public int CreatedByEmployeeId { get; set; }
    }
}
