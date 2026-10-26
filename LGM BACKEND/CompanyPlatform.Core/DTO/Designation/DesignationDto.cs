using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.Designation
{
    public class DesignationDto
    {
        public int ID { get; set; }

        [Required(ErrorMessage = "Designation name is required.")]
        public string DesignationName { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
