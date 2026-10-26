using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.Common
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _webHostEnvironment;

        public FileService(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<string?> SaveFileAsync(IFormFile file, string subfolder)
        {
            if (file == null || file.Length == 0)
            {
                return null;
            }

            // Path to the main uploads folder (e.g., wwwroot/uploads)
            var uploadsFolderPath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads");

            // Path to the company-specific folder (e.g., wwwroot/uploads/CompanyName)
            var companyFolderPath = Path.Combine(uploadsFolderPath, subfolder);

            // Create the directory if it doesn't exist
            if (!Directory.Exists(companyFolderPath))
            {
                Directory.CreateDirectory(companyFolderPath);
            }

            // Create a unique file name to avoid overwrites
            //var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";

            var extension = Path.GetExtension(file.FileName);

            var safeFileName =
                Path.GetFileNameWithoutExtension(file.FileName)
                    .Replace(" ", "_")
                    .Replace("+", "_")
                    .Replace("&", "_")
                    .Replace("#", "_");

            var uniqueFileName =
                $"{Guid.NewGuid()}_{safeFileName}{extension}";

            var filePath = Path.Combine(companyFolderPath, uniqueFileName);

            // Save the file to the path
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the web-accessible relative path to store in the DB
            return Path.Combine("/uploads", subfolder, uniqueFileName).Replace("\\", "/");
        }

        public Task DeleteFileAsync(string relativeFilePath)
        {
            var pathToDelete = relativeFilePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);

            var fullPath = Path.Combine(_webHostEnvironment.WebRootPath, pathToDelete);

            try
            {
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }
            }
            catch (IOException ex)
            {
                Console.WriteLine($"Error deleting file {fullPath}: {ex.Message}");
            }

            return Task.CompletedTask;
        }
    }
}