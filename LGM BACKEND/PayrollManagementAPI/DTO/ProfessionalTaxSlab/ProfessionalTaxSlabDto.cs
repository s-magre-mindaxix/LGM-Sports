using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.ProfessionalTaxSlab
{
    public class ProfessionalTaxSlabDto
    {
        public int Id { get; set; }
        [Required]
        public string State { get; set; }

        public string Gender { get; set; }
        [Required]
        public decimal MinGrossSalary { get; set; }
        public decimal? MaxGrossSalary { get; set; }
        [Required]
        public decimal TaxAmount { get; set; }
    }
}
