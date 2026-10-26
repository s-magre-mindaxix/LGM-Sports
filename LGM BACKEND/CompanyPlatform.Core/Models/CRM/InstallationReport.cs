using CompanyPlatform.Core.Models;
using System;
using System.Collections.Generic;

using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_InstallationReport")]
    public class InstallationReport
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Company")]
        public int CompanyId { get; set; }
        public virtual CompanyPlatform.Core.Models.Company Company { get; set; }

        [Required]
        [ForeignKey("Customer")]
        public int CustomerId { get; set; }
        public virtual Customer Customer { get; set; }

        [Required]
        public DateTime InstallationDate { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(4000)]
        public string ProductInformation { get; set; }

        [Required]
        [StringLength(2000)]
        public string InspectionSummary { get; set; }

        public string? CustomerNotes { get; set; }

        [Required]
        [StringLength(200)]
        public string Place { get; set; }

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        // Navigation property for related contacts
        public virtual ICollection<InstallationContact> Contacts { get; set; } = new List<InstallationContact>();
    }
}
