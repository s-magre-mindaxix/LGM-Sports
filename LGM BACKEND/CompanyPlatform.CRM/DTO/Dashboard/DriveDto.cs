using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.DTO.Dashboard
{
    public class DriveFolderDto
    {
        public List<FolderResponse> Folders { get; set; }
        public List<FileResponse> Files { get; set; }
    }

    public class FolderResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int? ParentFolderId { get; set; }

        public DateTime CreatedAt { get; set; }
    }

    public class FileResponse
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
        public string? UploadedBy { get; set; }
        public DateTime UploadedAt { get; set; }

        public DateTime CreatedAt { get; set; }

    }

    public class CreateFolderRequest
    {
        public string Name { get; set; }
        public int? ParentId { get; set; }
    }
}
