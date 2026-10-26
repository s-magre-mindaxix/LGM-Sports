using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.SalaryStructure
{
    public class SalaryStructureCreateDto
    {
        [Required]
        public int EmployeeID { get; set; }

        [Required]
        public DateTime EffectiveDate { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Active";

        public decimal? MonthlySalary { get; set; }
        public List<ComponentCreateItemDto>? Components { get; set; }
    }

    public class ComponentCreateItemDto
    {
        public int SalaryComponentID { get; set; }
        public decimal Amount { get; set; }
    }

    public class SalaryStructureReviseDto
    {
        [Required]
        public decimal NewMonthlySalary { get; set; }

        [Required]
        public DateTime NewEffectiveDate { get; set; }

        public List<ComponentCreateItemDto>? Components { get; set; }
    }

    public class SalaryHistoryComponentDto
    {
        public string ComponentName { get; set; }
        public string ComponentType { get; set; }
        public decimal Amount { get; set; }
    }

    public class SalaryStructureHistoryItemDto
    {
        public DateTime? EffectiveDate { get; set; }
        public string Status { get; set; }
        public decimal GrossSalary { get; set; }
        public decimal TotalDeduction { get; set; }
        public decimal NetSalary { get; set; }
        public List<SalaryHistoryComponentDto> Components { get; set; }
    }
}
