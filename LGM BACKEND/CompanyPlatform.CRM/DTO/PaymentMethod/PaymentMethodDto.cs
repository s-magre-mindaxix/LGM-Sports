
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.PaymentMethod
{
    public class PaymentMethodDto
    {
        public int PaymentMethodId { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}
