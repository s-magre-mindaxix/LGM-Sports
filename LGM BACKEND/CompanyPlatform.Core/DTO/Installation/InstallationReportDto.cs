using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.DTO.Installation
{
    public class InstallationReportDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string CompanyName { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public DateTime InstallationDate { get; set; }
        public string ProductInformation { get; set; }
        public string InspectionSummary { get; set; }
        public string? CustomerNotes { get; set; }
        public string Place { get; set; }
        public DateTime CreatedOn { get; set; }

        public string? CustomerAddress { get; set; }

        public AddressDto? AddressObj { get; set; }
        public ICollection<InstallationContactDto> Contacts { get; set; } = new List<InstallationContactDto>();
    }

    public class AddressDto
    {
        public string? FlatBlockNo { get; set; }
        public string? PremisesName { get; set; }
        public string? Road { get; set; }
        public string? Area { get; set; }
        public string? Town { get; set; }
        public string? PinNo { get; set; }
    }
}
