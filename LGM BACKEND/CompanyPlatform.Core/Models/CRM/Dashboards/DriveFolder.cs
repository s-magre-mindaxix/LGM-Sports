using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Dashboards
{
    public class DriveFolder
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int? ParentFolderId { get; set; }
        public string UserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DriveFolder ParentFolder { get; set; }
        public ICollection<DriveFolder> SubFolders { get; set; }
        public ICollection<DriveFile> Files { get; set; }
    }
}
