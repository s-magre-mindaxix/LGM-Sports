using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Dashboards
{
    public class DriveFile
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
        public int? FolderId { get; set; }
        public string UserId { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public int? DepartmentId { get; set; } // Added for Common Drive
        public string? UploadedBy { get; set; } // Name of user who uploaded

        public DriveFolder Folder { get; set; }
    }
}
