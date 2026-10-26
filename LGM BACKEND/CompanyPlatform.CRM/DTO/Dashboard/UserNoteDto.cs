using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.DTO.Dashboard
{
    public class CreateNoteRequest
    {
        public string Content { get; set; }
        public string GradientClass { get; set; }
        public string AuthorRole { get; set; }
    }

    public class UserNoteResponse
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string GradientClass { get; set; }
        public string AuthorRole { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
