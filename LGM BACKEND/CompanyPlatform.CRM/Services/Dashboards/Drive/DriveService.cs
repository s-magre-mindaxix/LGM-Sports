using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM.Dashboards;
using CompanyPlatform.CRM.DTO.Dashboard;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace CompanyPlatform.CRM.Services.Dashboards.Drive
{
    public class DriveService : IDriveService
    {
        private readonly ApplicationDBContext _context;
        private readonly string _storagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "UserDrive");

        public DriveService(ApplicationDBContext context)
        {
            _context = context;
            if (!Directory.Exists(_storagePath)) Directory.CreateDirectory(_storagePath);
        }

        public async Task<DriveFolderDto> GetFolderContent(string userId, int? folderId)
        {
            var folders = await _context.Tbl_DriveFolders
                .Where(f => f.UserId == userId && f.ParentFolderId == folderId)
                .Select(f => new FolderResponse
                {
                    Id = f.Id,
                    Name = f.Name,
                    ParentFolderId = f.ParentFolderId,
                    CreatedAt = DateTime.SpecifyKind(f.CreatedAt, DateTimeKind.Utc)
                })
                .ToListAsync();

            var files = await _context.Tbl_DriveFiles
                .Where(f => f.UserId == userId && f.FolderId == folderId)
                .Select(f => new FileResponse
                {
                    Id = f.Id,
                    FileName = f.FileName,
                    FilePath = f.FilePath,
                    FileType = f.FileType,
                    FileSize = f.FileSize,
                    CreatedAt = DateTime.SpecifyKind(f.UploadedAt, DateTimeKind.Utc)
                })
                .ToListAsync();

            return new DriveFolderDto { Folders = folders, Files = files };
        }

        public async Task<DriveFolder> CreateFolder(string userId, string name, int? parentId)
        {
            var folder = new DriveFolder { Name = name, ParentFolderId = parentId, UserId = userId };
            _context.Tbl_DriveFolders.Add(folder);
            await _context.SaveChangesAsync();
            return folder;
        }

        public async Task<DriveFile> UploadFile(string userId, IFormFile file, int? folderId)
        {
            var userPath = Path.Combine(_storagePath, userId);
            if (!Directory.Exists(userPath)) Directory.CreateDirectory(userPath);

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var fullPath = Path.Combine(userPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var driveFile = new DriveFile
            {
                FileName = file.FileName,
                FilePath = $"/UserDrive/{userId}/{fileName}",
                FileType = file.ContentType,
                FileSize = file.Length,
                FolderId = folderId,
                UserId = userId
            };

            _context.Tbl_DriveFiles.Add(driveFile);
            await _context.SaveChangesAsync();
            return driveFile;
        }

        public async Task DeleteItem(string userId, int id, bool isFolder)
        {
            if (isFolder)
            {
                var folder = await _context.Tbl_DriveFolders
                    .FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

                if (folder != null)
                {
                    _context.Tbl_DriveFolders.Remove(folder);
                }
            }
            else
            {
                var file = await _context.Tbl_DriveFiles
                    .FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

                if (file != null)
                {
                    var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", file.FilePath.TrimStart('/'));
                    if (File.Exists(physicalPath))
                    {
                        File.Delete(physicalPath);
                    }

                    _context.Tbl_DriveFiles.Remove(file);
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
