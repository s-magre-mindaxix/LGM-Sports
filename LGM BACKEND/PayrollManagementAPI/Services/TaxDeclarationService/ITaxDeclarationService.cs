using PayrollManagementAPI.DTO;

namespace PayrollManagementAPI.Services.TaxDeclarationService
{
    public interface ITaxDeclarationService
    {
        Task<TaxDeclarationDto> GetDeclarationAsync(int employeeId, string financialYear);
        Task<TaxDeclarationDto> CreateOrUpdateDeclarationAsync(TaxDeclarationDto dto);

        Task<bool> ApproveDeclarationDetailsAsync(int declarationId, List<DeclarationApprovalDto> approvalDtos);
        Task<DocumentDto> AddDocumentAsync(int detailId, IFormFile file);
        Task<bool> DeleteDocumentAsync(int documentId);
        Task<string> SaveFileAsync(IFormFile file, string subfolder);
        void DeleteFile(string filePath);
    }
}
