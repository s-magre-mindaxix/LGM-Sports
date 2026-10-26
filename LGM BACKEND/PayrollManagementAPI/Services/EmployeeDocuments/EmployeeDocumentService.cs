using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO.EmployeeDocuments;
using PayrollManagementAPI.Services.EmployeeDocuments;
using PayrollManagementAPI.Services.Notification;
using CompanyPlatform.Core.DTO.EmployeeDocuments;
using CompanyPlatform.Core.Services.Notification;

namespace PayrollManagementAPI.Services.EmployeeDocument
{
    public class EmployeeDocumentService : IEmployeeDocumentService
    {
        private readonly ApplicationDBContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly ILogger<EmployeeDocumentService> _logger;
        private readonly INotificationHelper _notificationHelper;

        public EmployeeDocumentService(ApplicationDBContext context, IWebHostEnvironment webHostEnvironment, ILogger<EmployeeDocumentService> logger, INotificationHelper notificationHelper)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
            _logger = logger;
            _notificationHelper = notificationHelper;
        }

        public async Task<DocumentResponseDto> UploadDocumentAsync(DocumentUploadDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
            {
                throw new ArgumentException("File is empty or not provided.");
            }

            //const int maxFileSize = 1 * 1024 * 1024;
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf" };

            //if (dto.File.Length > maxFileSize)
            //{
            //    throw new ArgumentException($"File size exceeds the limit of 1 MB.");
            //}

            var extension = Path.GetExtension(dto.File.FileName).ToLowerInvariant();

            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                throw new ArgumentException("Invalid file type. Allowed types are JPG, PNG, and PDF.");
            }

            //string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "documents");
            //if (!Directory.Exists(uploadsFolder))
            //{
            //    Directory.CreateDirectory(uploadsFolder);
            //}


            //string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.File.FileName);
            //string filePath = Path.Combine(uploadsFolder, uniqueFileName);


            //using (var stream = new FileStream(filePath, FileMode.Create))
            //{
            //    await dto.File.CopyToAsync(stream);
            //}

            string webRootPath = _webHostEnvironment.WebRootPath;

            // If wwwroot is null then create path manually
            if (string.IsNullOrEmpty(webRootPath))
            {
                webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            // Create wwwroot if not exists
            if (!Directory.Exists(webRootPath))
            {
                Directory.CreateDirectory(webRootPath);
            }

            // documents folder path
            string uploadsFolder = Path.Combine(webRootPath, "documents");

            // Create documents folder if not exists
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate unique filename
            string uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.File.FileName)}";

            // Final file path
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            try
            {
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }

                _logger.LogInformation("File saved successfully at: {FilePath}", filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while uploading file.");
                throw new Exception($"File upload failed: {ex.Message}");
            }

            _logger.LogInformation("File saved to: {FilePath}", filePath);

            var employeeExists = await _context.Employees
            .AnyAsync(e => e.ID == dto.EmployeeID && !e.IsDeleted);

            if (!employeeExists)
            {
                throw new Exception($"Invalid EmployeeID: {dto.EmployeeID}");
            }


            var documentEntity = new CompanyPlatform.Core.Models.CRM.Employee.EmployeeDocument
            {
                EmployeeID = dto.EmployeeID,
                DocumentName = dto.DocumentName,
                FilePath = uniqueFileName,        
                UploadedDate = DateTime.UtcNow
            };

            //await _context.Tb_EmployeeDocuments.AddAsync(documentEntity);
            //await _context.SaveChangesAsync();

            _logger.LogInformation("Document record created in DB with ID: {DocumentId}", documentEntity.ID);

            await _context.Tb_EmployeeDocuments.AddAsync(documentEntity);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DATABASE SAVE ERROR");

                throw new Exception(
                    ex.InnerException?.Message ?? ex.Message
                );
            }

            return new DocumentResponseDto
            {
                ID = documentEntity.ID,
                EmployeeID = documentEntity.EmployeeID,
                DocumentName = documentEntity.DocumentName,
                FilePath = documentEntity.FilePath,
                UploadedDate = documentEntity.UploadedDate
            };
        }

        public async Task<IEnumerable<DocumentResponseDto>> GetDocumentsByEmployeeIdAsync(int employeeId)
        {
            _logger.LogInformation("Fetching documents for EmployeeID: {EmployeeId}", employeeId);
            return await _context.Tb_EmployeeDocuments
                .Where(d => d.EmployeeID == employeeId && d.IsDeleted == false)
                .Select(d => new DocumentResponseDto
                {
                    ID = d.ID,
                    EmployeeID = d.EmployeeID,
                    DocumentName = d.DocumentName,
                    FilePath = d.FilePath,
                    UploadedDate = d.UploadedDate

                })
                .ToListAsync();
        }

        public async Task<(byte[] content, string contentType, string fileName)?>
      GetDocumentForDownloadAsync(int documentId)
        {
            _logger.LogInformation(
                "Fetching document for download. DocumentId: {DocumentId}",
                documentId);

            var document = await _context.Tb_EmployeeDocuments
                .FirstOrDefaultAsync(d => d.ID == documentId && !d.IsDeleted);

            if (document == null)
            {
                _logger.LogWarning(
                    "Document not found in database. DocumentId: {DocumentId}",
                    documentId);

                return null;
            }

            _logger.LogInformation(
                "Document found. ID: {Id}, EmployeeID: {EmployeeID}, FilePath: {FilePath}",
                document.ID,
                document.EmployeeID,
                document.FilePath);

            var fileNameFromDb = Path.GetFileName(document.FilePath);

            var possiblePaths = new List<string>();

            // --------------------------------------------------
            // 1. New format
            // wwwroot/documents/{filename}
            // --------------------------------------------------
            if (!string.IsNullOrWhiteSpace(_webHostEnvironment.WebRootPath))
            {
                possiblePaths.Add(
                    Path.Combine(
                        _webHostEnvironment.WebRootPath,
                        "documents",
                        fileNameFromDb
                    )
                );
            }

            // --------------------------------------------------
            // 2. Old format
            // wwwroot/Uploads/Documents/{filename}
            // --------------------------------------------------
            if (!string.IsNullOrWhiteSpace(_webHostEnvironment.WebRootPath))
            {
                possiblePaths.Add(
                    Path.Combine(
                        _webHostEnvironment.WebRootPath,
                        "Uploads",
                        "Documents",
                        fileNameFromDb
                    )
                );
            }

            // --------------------------------------------------
            // 3. Old format without wwwroot
            // ApplicationRoot/Uploads/Documents/{filename}
            // --------------------------------------------------
            possiblePaths.Add(
                Path.Combine(
                    _webHostEnvironment.ContentRootPath,
                    "Uploads",
                    "Documents",
                    fileNameFromDb
                )
            );

            // --------------------------------------------------
            // 4. If DB FilePath itself contains /Uploads/Documents
            // --------------------------------------------------
            if (!string.IsNullOrWhiteSpace(document.FilePath))
            {
                var relativePath = document.FilePath
                    .TrimStart('/', '\\')
                    .Replace('/', Path.DirectorySeparatorChar)
                    .Replace('\\', Path.DirectorySeparatorChar);

                possiblePaths.Add(
                    Path.Combine(
                        _webHostEnvironment.ContentRootPath,
                        relativePath
                    )
                );

                if (!string.IsNullOrWhiteSpace(_webHostEnvironment.WebRootPath))
                {
                    possiblePaths.Add(
                        Path.Combine(
                            _webHostEnvironment.WebRootPath,
                            relativePath
                        )
                    );
                }
            }

            // Remove duplicate paths
            possiblePaths = possiblePaths
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            // --------------------------------------------------
            // Log every path we are checking
            // --------------------------------------------------
            foreach (var path in possiblePaths)
            {
                _logger.LogInformation(
                    "Checking document path: {Path}",
                    path);
            }

            // --------------------------------------------------
            // Find actual file
            // --------------------------------------------------
            var existingFilePath = possiblePaths
                .FirstOrDefault(File.Exists);

            if (existingFilePath == null)
            {
                _logger.LogError(
                    "DOCUMENT FILE NOT FOUND ON SERVER. DocumentId: {DocumentId}, DB FilePath: {FilePath}",
                    documentId,
                    document.FilePath);

                return null;
            }

            _logger.LogInformation(
                "DOCUMENT FOUND at: {FilePath}",
                existingFilePath);

            var fileBytes = await File.ReadAllBytesAsync(existingFilePath);

            var contentType = GetMimeType(document.DocumentName);

            return (
                fileBytes,
                contentType,
                document.DocumentName
            );
        }
        public async Task<(bool Success, string Message)> UpdateDocumentAsync(DocumentUpdateDto dto)
        {
            var document = await _context.Tb_EmployeeDocuments
                .FirstOrDefaultAsync(d => d.ID == dto.DocumentId && d.IsDeleted == false);

            if (document == null)
            {
                return (false, "Document not found or deleted.");
            }

            if (!string.IsNullOrEmpty(dto.DocumentName))
                document.DocumentName = dto.DocumentName;

            if (dto.File != null && dto.File.Length > 0)
            {
                string uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "documents");

                string oldFilePath = Path.Combine(uploadsFolder, document.FilePath);
                if (File.Exists(oldFilePath))
                    File.Delete(oldFilePath);

                string newUniqueName = Guid.NewGuid().ToString() + Path.GetExtension(dto.File.FileName);
                string newFilePath = Path.Combine(uploadsFolder, newUniqueName);

                using (var stream = new FileStream(newFilePath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }

                document.FilePath = newUniqueName;
            }

            await _context.SaveChangesAsync();

            await _notificationHelper.SendManagerNotificationAsync(document.EmployeeID, "Documents");

            return (true, "Document updated successfully.");
        }

        public async Task<bool> DeleteDocumentAsync(int documentId)
        {
            var document = await _context.Tb_EmployeeDocuments.FindAsync(documentId);

            if (document == null)
                return false;
            document.IsDeleted = true;

            await _context.SaveChangesAsync();
            await _notificationHelper.SendManagerNotificationAsync(document.EmployeeID, $"a document ('{document.DocumentName}')");
            return true;
        }

        private string GetMimeType(string fileName)
        {
        
            var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(fileName, out var contentType))
            {
                contentType = "application/octet-stream"; 
            }
            return contentType;
        }

        public async Task<bool> UpdateDocumentNameAsync(int documentId, string newName)
        {
            var document = await _context.Tb_EmployeeDocuments
                .FirstOrDefaultAsync(d => d.ID == documentId && d.IsDeleted == false);

            if (document == null)
            {
                _logger.LogWarning("Update name failed. Document with ID {DocumentId} not found.", documentId);
                return false;
            }

            document.DocumentName = newName;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated name for document with ID {DocumentId}", documentId);
            return true;
        }
    }
}