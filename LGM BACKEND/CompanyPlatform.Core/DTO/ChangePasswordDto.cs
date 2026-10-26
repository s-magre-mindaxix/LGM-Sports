using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO
{
    public class ChangePasswordDto
    {
        [Required]
        public string OldPassword { get; set; }

        [Required]
        public string NewPassword { get; set; }
    }
}
