using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.SalaryComponent
{
    public class SalaryComponentCreateDto
    {
        [Required]
        [StringLength(100)]
        public string ComponentName { get; set; }

        [Required]
        // You can add validation to ensure this is either "Earning" or "Deduction"
        public string ComponentType { get; set; }

        public bool IsTaxable { get; set; }
    }
}
