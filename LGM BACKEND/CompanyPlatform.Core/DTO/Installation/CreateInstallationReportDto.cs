using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.DTO.Installation
{
    public class CreateInstallationReportDto
    {
        [Required]
        public int CompanyId { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [Required]
        public DateTime InstallationDate { get; set; }

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

        public ICollection<InstallationContactDto> Contacts { get; set; } = new List<InstallationContactDto>();
    }
}
