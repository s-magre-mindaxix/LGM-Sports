using Microsoft.AspNetCore.Http;

namespace CompanyPlatform.Core.DTO.EmployeeDocuments
{
    public class DocumentUpdateDto
    {
        public int DocumentId { get; set; }
        public string DocumentName { get; set; }   
        public IFormFile? File { get; set; }
    }
}
