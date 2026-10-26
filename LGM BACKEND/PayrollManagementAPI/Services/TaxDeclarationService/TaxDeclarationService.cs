using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO;
using CompanyPlatform.Core.Models;
using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.Services.TaxDeclarationService
{
    public class TaxDeclarationService : ITaxDeclarationService
    {
        private readonly ApplicationDBContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TaxDeclarationService(ApplicationDBContext context, IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _env = env;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<TaxDeclarationDto> GetDeclarationAsync(int employeeId, string financialYear)
        {
            var declaration = await _context.Tbl_EmployeeTaxDeclarations
                .Include(d => d.DeclarationDetails)
                    .ThenInclude(dd => dd.Documents) // Include the documents
                .FirstOrDefaultAsync(d => d.EmployeeID == employeeId && d.FinancialYear == financialYear);

            if (declaration == null) return null;

            // Map Entity to DTO
            return new TaxDeclarationDto
            {
                ID = declaration.ID,
                EmployeeID = declaration.EmployeeID,
                FinancialYear = declaration.FinancialYear,
                TaxRegime = declaration.TaxRegime,
                Status = declaration.Status,
                DeclarationDetails = declaration.DeclarationDetails.Select(dd => new EmployeeDeclarationDetailDto
                {
                    ID = dd.ID,
                    Section = dd.Section,
                    DeclaredAmount = dd.DeclaredAmount,
                    ApprovedAmount = dd.ApprovedAmount,
                    ApprovalStatus = dd.ApprovalStatus,
                    Remarks = dd.Remarks,
                    // Map documents to DTOs
                    Documents = dd.Documents.Select(doc => new DocumentDto
                    {
                        ID = doc.ID,
                        FileName = doc.FileName,
                        FilePath = doc.FilePath
                    }).ToList()
                }).ToList()
            };
        }

        public async Task<TaxDeclarationDto> CreateOrUpdateDeclarationAsync(TaxDeclarationDto dto)
        {
            var declaration = await _context.Tbl_EmployeeTaxDeclarations
                .Include(d => d.DeclarationDetails)
                    .ThenInclude(dd => dd.Documents)
                .FirstOrDefaultAsync(d => d.EmployeeID == dto.EmployeeID && d.FinancialYear == dto.FinancialYear);

            if (declaration == null)
            {
                declaration = new EmployeeTaxDeclaration
                {
                    EmployeeID = dto.EmployeeID,
                    FinancialYear = dto.FinancialYear,
                    DeclarationDetails = new List<EmployeeDeclarationDetail>()
                };
                _context.Tbl_EmployeeTaxDeclarations.Add(declaration);
            }

            declaration.TaxRegime = dto.TaxRegime;
            declaration.Status = dto.Status;
            declaration.DeclarationDate = System.DateTime.UtcNow;

            var incomingDetailIds = dto.DeclarationDetails.Select(d => d.ID).ToList();

            // Remove details that are no longer present in the DTO
            var detailsToRemove = declaration.DeclarationDetails
                .Where(d => !incomingDetailIds.Contains(d.ID) && d.ID != 0)
                .ToList();

            if (detailsToRemove.Any())
            {
                foreach (var detail in detailsToRemove)
                {
                    foreach (var doc in detail.Documents)
                    {
                        DeleteFile(doc.FilePath);
                    }
                }
                _context.EmployeeDeclarationDetails.RemoveRange(detailsToRemove);
            }

            foreach (var detailDto in dto.DeclarationDetails)
            {
                var existingDetail = declaration.DeclarationDetails
                    .FirstOrDefault(d => d.Section == detailDto.Section);

                if (existingDetail != null)
                {
                    existingDetail.DeclaredAmount = detailDto.DeclaredAmount;
                    // Document management would happen via a separate endpoint for simplicity
                }
                else
                {
                    declaration.DeclarationDetails.Add(new EmployeeDeclarationDetail
                    {
                        Section = detailDto.Section,
                        DeclaredAmount = detailDto.DeclaredAmount,
                        ApprovalStatus = "Pending",
                        Remarks = ""
                    });
                }
            }

            await _context.SaveChangesAsync();
            return await GetDeclarationAsync(declaration.EmployeeID, declaration.FinancialYear);
        }

        public async Task<bool> ApproveDeclarationDetailsAsync(int declarationId, List<DeclarationApprovalDto> approvalDtos)
        {
            var declaration = await _context.Tbl_EmployeeTaxDeclarations
               .Include(d => d.DeclarationDetails)
               .FirstOrDefaultAsync(d => d.ID == declarationId);

            if (declaration == null)
            {
                throw new KeyNotFoundException("Declaration not found.");
            }

            foreach (var approvalDto in approvalDtos)
            {
                var detail = declaration.DeclarationDetails.FirstOrDefault(d => d.ID == approvalDto.DetailId);
                if (detail != null)
                {
                    detail.ApprovedAmount = approvalDto.ApprovedAmount;
                    detail.ApprovalStatus = approvalDto.ApprovalStatus;
                    detail.Remarks = approvalDto.Remarks ?? "";
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<DocumentDto> AddDocumentAsync(int detailId, IFormFile file)
        {
            var detail = await _context.EmployeeDeclarationDetails.FindAsync(detailId);
            if (detail == null) throw new KeyNotFoundException("Declaration detail not found.");

            var filePath = await SaveFileAsync(file, "proofs");

            var document = new EmployeeDeclarationDocument
            {
                EmployeeDeclarationDetailID = detailId,
                FileName = file.FileName,
                StoredFileName = Path.GetFileName(filePath), // Get the unique name from the URL
                FilePath = filePath,
                ContentType = file.ContentType
            };

            _context.Tbl_EmployeeDeclarationDocuments.Add(document);
            await _context.SaveChangesAsync();

            return new DocumentDto { ID = document.ID, FileName = document.FileName, FilePath = document.FilePath };
        }

        public async Task<bool> DeleteDocumentAsync(int documentId)
        {
            var document = await _context.Tbl_EmployeeDeclarationDocuments.FindAsync(documentId);
            if (document == null) return false;

            DeleteFile(document.FilePath);

            _context.Tbl_EmployeeDeclarationDocuments.Remove(document);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<string> SaveFileAsync(IFormFile file, string subfolder)
        {
            var folderPath = Path.Combine(_env.WebRootPath, subfolder);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(folderPath, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var request = _httpContextAccessor.HttpContext.Request;
            var url = $"{request.Scheme}://{request.Host}/{subfolder}/{uniqueFileName}";

            return url;
        }

        public void DeleteFile(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl)) return;

            // Convert URL to local path
            var uri = new Uri(fileUrl);
            var localPath = Path.Combine(_env.WebRootPath, uri.AbsolutePath.TrimStart('/'));

            if (File.Exists(localPath))
            {
                File.Delete(localPath);
            }
        }
    }  
}


