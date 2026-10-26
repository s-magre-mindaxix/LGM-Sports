using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models
{
    public class VendorContact
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Vendor")]
        public int VendorId { get; set; }
        public virtual Vendor Vendor { get; set; }

        
        public string? PersonName { get; set; }
        public string? Designation { get; set; }
        public string? MobileNo { get; set; }
        public string? EmailAddress { get; set; }
        public string? DocsAttachment { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
