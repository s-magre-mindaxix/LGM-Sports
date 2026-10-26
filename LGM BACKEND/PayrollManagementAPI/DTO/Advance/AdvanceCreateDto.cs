using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.Advance
{
    public class AdvanceCreateDto
    {
        [Required]
        public int EmployeeID { get; set; }

        [Required]
        [Range(1, double.MaxValue, ErrorMessage = "Advance amount must be greater than zero.")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime RequestDate { get; set; }

        [MaxLength(500)]
        public string Reason { get; set; }
    }
}
