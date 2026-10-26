using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.ExpenseClaim
{
    public class GenerateReportDto
    {
        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }
    }
}
