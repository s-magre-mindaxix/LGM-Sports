using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.AgencyDTO
{
    public class AgencyDto
    {
        public int Id { get; set; }

        public string AgencyName { get; set; }

        public string? AgencyCode { get; set; }

        public int AgencyTypeId { get; set; }

        public string? AgencyTypeName { get; set; }

        public string? AgencyShortName { get; set; }

        public string? AgencyLogo { get; set; }

        public IFormFile? LogoFile { get; set; }

        public string? PANNo { get; set; }

        public string? TANNo { get; set; }

        public string? GSTIN { get; set; }

        public string? CINNo { get; set; }

        public string? IATACode { get; set; }

        public string? FMCCode { get; set; }

        public string? LicenseNo { get; set; }

        public string? Website { get; set; }

        public List<AgencyAddressDto> Addresses { get; set; }
            = new();

        public List<AgencyContactDto> Contacts { get; set; }
            = new();

        public List<AgencyBankDetailDto> BankDetails { get; set; }
            = new();
    }

    public class AgencyAddressDto
    {
        public int Id { get; set; }

        public string? AddressType { get; set; }

        public string? FlatBlockNo { get; set; }

        public string? Premises { get; set; }

        public string? RoadStreetLane { get; set; }

        public string? Area { get; set; }

        public string? TownCity { get; set; }

        public string? Pincode { get; set; }

        public int CountryId { get; set; }

        public string? CountryName { get; set; }

        public int StateId { get; set; }

        public string? StateName { get; set; }

        public string? MobileNo { get; set; }

        public string? AlternateMobileNo { get; set; }

        public string? EmailAddress { get; set; }

        public string? AlternateEmailAddress { get; set; }
    }

    public class AgencyContactDto
    {
        public int Id { get; set; }

        public string? PersonName { get; set; }

        public string? Designation { get; set; }

        public string? Department { get; set; }

        public string? MobileNo { get; set; }

        public string? AlternateMobileNo { get; set; }

        public string? EmailAddress { get; set; }

        public string? DocsAttachment { get; set; }

        public IFormFile? ContactFile { get; set; }
    }

    public class AgencyBankDetailDto
    {
        public int Id { get; set; }

        public string? BankName { get; set; }

        public string? BankAddress { get; set; }

        public string? AccountHolderName { get; set; }

        public string? AccountNo { get; set; }

        public string? IFSCCode { get; set; }

        public string? SwiftCode { get; set; }

        public string? IBANNo { get; set; }

        public string? EmailAddress { get; set; }
    }
}
