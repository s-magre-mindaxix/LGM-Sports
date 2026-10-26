using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
