using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.EmployeePFDetails
{
    public class ViewPFDetailsDto
    {
        public int ID { get; set; }
        public int EmployeeID { get; set; }
        public decimal PFDeductionPercentage { get; set; }
        public bool IsCappedAt15k { get; set; }
    }

    public class UpsertPFDetailsDto
    {
        [Required]
        public int EmployeeID { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal PFDeductionPercentage { get; set; }

        public bool IsCappedAt15k { get; set; }
    }
}
