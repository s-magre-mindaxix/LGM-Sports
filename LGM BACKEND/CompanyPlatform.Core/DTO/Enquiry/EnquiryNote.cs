using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.DTO.Enquiry
{
    public class EnquiryNote
    {
        [Key]
        public int Id { get; set; }
        public int EnquiryId { get; set; }
        public string Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public int CreatedByEmployeeId { get; set; }
        public string AuthorName { get; set; } 
    }
}
