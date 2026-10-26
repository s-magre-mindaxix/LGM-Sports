using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.EmployeeDocuments
{
    public class UpdateDocumentNameDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string NewDocumentName { get; set; }
    }
}
