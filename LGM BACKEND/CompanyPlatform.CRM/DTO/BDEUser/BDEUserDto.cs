using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.BDEUser
{
    public class BDEUserDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Value is required.")]
        public string Value { get; set; }

        [Required(ErrorMessage = "Code is required.")]
        public string Code { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}