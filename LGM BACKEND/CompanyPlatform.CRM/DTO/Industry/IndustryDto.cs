using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Industry
{

    public class IndustryDto
    {
        public int IndustryId { get; set; }

        [Required]
        public string IndustryName { get; set; }

        public string IndustryCode { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}

//    public class IndustryDto
//    {
//        public int ID { get; set; }

//        [Required(ErrorMessage = "Industry name is required.")]
//        public string IndustryName { get; set; }

//        public string Description { get; set; }

//        [DefaultValue(true)]
//        public bool IsActive { get; set; }
//    }
//}
