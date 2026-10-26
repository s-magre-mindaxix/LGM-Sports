using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Dashboards
{
    public class UserNotes
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string UserId { get; set; }
        public string GradientClass { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string AuthorRole { get; set; }
    }
}
