using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.Commonmaster
{
    public class ProductVersion
    {
        public int Id { get; set; }
        public string VersionName { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
