using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CompanyPlatform.Core.Models.ERP.Shipment;

namespace CompanyPlatform.Core.Models.ERP
{
    [Table("tbl_Agency")]
    public class Agency
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string AgencyName { get; set; }

        public string? AgencyCode { get; set; }

        [ForeignKey("AgencyType")]
        public int AgencyTypeId { get; set; }

        public virtual AgencyType AgencyType { get; set; }

        public string? AgencyShortName { get; set; }

        public string? AgencyLogo { get; set; }

        public string? PANNo { get; set; }

        public string? TANNo { get; set; }

        public string? GSTIN { get; set; }

        public string? CINNo { get; set; }

        public string? IATACode { get; set; }

        public string? FMCCode { get; set; }

        public string? LicenseNo { get; set; }

        public string? Website { get; set; }

        public bool IsDeleted { get; set; } = false;

        // Navigation Properties
        public virtual ICollection<AgencyAddress> Addresses { get; set; } = new List<AgencyAddress>();

        public virtual ICollection<AgencyContact> Contacts { get; set; } = new List<AgencyContact>();

        public virtual ICollection<AgencyBankDetail> BankDetails { get; set; } = new List<AgencyBankDetail>();

        public virtual ICollection<ShipmentAgencyAssignment> ShipmentAgencyAssignments  { get; set; } = new List<ShipmentAgencyAssignment>();
    }
}
