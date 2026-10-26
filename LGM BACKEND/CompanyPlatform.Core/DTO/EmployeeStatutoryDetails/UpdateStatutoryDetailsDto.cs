using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.EmployeeStatutoryDetails
{
    public class UpdateStatutoryDetailsDto
    {
        [Required]
        //[RegularExpression(@"^\d{12}$", ErrorMessage = "Aadhaar number must be 12 digits.")]
        public string AadhaarNumber { get; set; }

        [Required]
        //[RegularExpression(@"^[A-Z]{5}[0-9]{4}[A-Z]{1}$", ErrorMessage = "Invalid PAN number format.")]
        public string PANNumber { get; set; }

        public string? UANNo { get; set; }
        public string? PFNo { get; set; }
        public string? ESINo { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
