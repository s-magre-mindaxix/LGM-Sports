using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.Common
{
    public interface IFileService
    {
        Task<string?> SaveFileAsync(IFormFile file, string subfolder);

        Task DeleteFileAsync(string relativeFilePath);
    }
}