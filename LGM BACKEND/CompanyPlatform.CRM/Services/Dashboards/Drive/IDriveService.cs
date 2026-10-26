using CompanyPlatform.Core.Models.CRM.Dashboards;
using CompanyPlatform.CRM.DTO.Dashboard;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Dashboards.Drive
{
    public interface IDriveService
    {
        Task<DriveFolderDto> GetFolderContent(string userId, int? folderId);
        Task<DriveFolder> CreateFolder(string userId, string name, int? parentId);
        Task<DriveFile> UploadFile(string userId, IFormFile file, int? folderId);
        Task DeleteItem(string userId, int id, bool isFolder);
    }
}
