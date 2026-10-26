using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.EmployeeDocuments
{
    public class DocumentUploadDto
    {
        [Required]
        public int EmployeeID { get; set; }

        [Required]
        public IFormFile File { get; set; }

        public string DocumentName { get; set; }
    }
}
