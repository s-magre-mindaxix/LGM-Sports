using CompanyPlatform.Core.DTO.EmployeeDocuments;

namespace PayrollManagementAPI.Services.EmployeeDocuments
{
    public interface IEmployeeDocumentService
    {
        Task<DocumentResponseDto> UploadDocumentAsync(DocumentUploadDto dto);
        Task<IEnumerable<DocumentResponseDto>> GetDocumentsByEmployeeIdAsync(int employeeId);
        Task<(byte[] content, string contentType, string fileName)?> GetDocumentForDownloadAsync(int documentId);
        Task<bool> DeleteDocumentAsync(int documentId);
        Task<(bool Success, string Message)> UpdateDocumentAsync(DocumentUpdateDto dto);
        Task<bool> UpdateDocumentNameAsync(int documentId, string newName);

    }
}
