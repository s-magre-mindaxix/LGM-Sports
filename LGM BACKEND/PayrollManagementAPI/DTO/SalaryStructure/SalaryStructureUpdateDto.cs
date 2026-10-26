using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.SalaryStructure
{
    public class SalaryStructureUpdateDto
    {
        [Required]
        public int EmployeeID { get; set; }

        [Required]
        public DateTime EffectiveDate { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; }

        [MinLength(1)]
        public List<ComponentAmountDto> Components { get; set; }
    }

}
