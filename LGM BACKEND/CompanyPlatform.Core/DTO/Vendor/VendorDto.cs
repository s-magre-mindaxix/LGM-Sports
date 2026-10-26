using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.DTO.Vendor
{
    public class VendorDto
    {
        public int Id { get; set; }
        public string VendorName { get; set; }
        public string VendorCode { get; set; }
        public string? VendorShortName { get; set; }
        public string? VendorDivision { get; set; }
        public string? VendorLogo { get; set; }

        public IFormFile? LogoFile { get; set; }
        public string? VendorPAN { get; set; }
        public string? VendorTAN { get; set; }
        public string? VATNo { get; set; }
        public string? MSMENo { get; set; }
        public string? GSTIN { get; set; }
        public string? CIN { get; set; }
        public List<VendorAddressDto> Addresses { get; set; } = new();
        public List<VendorContactDto> PrincipalContacts { get; set; } = new();
        public List<VendorBankDetailDto> BankDetails { get; set; } = new();
    }

    public class VendorAddressDto
    {
        public int Id { get; set; }

        public string? AddressType {  get; set; }
        public string? FlatBlockNo { get; set; }
        public string? Premises { get; set; }
        public string? RoadStrLane { get; set; }
        public string? Area { get; set; }
        public string? Town { get; set; }
        public string? PinNo { get; set; }
        public int CountryId { get; set; }
        public int StateId { get; set; }

        public string? CountryName { get; set; } 
        public string? StateName { get; set; }   
        public string? MobileNo { get; set; }
        public string? AltMobileNo { get; set; }
        public string? EmailAddress { get; set; }
        public string? AltEmailAddress { get; set; }
    }

    public class VendorContactDto
    {
        public int Id { get; set; }
        public string? PersonName { get; set; }
        public string? Designation { get; set; }
        public string? MobileNo { get; set; }
        public string? EmailAddress { get; set; }
        public string? DocsAttachment { get; set; }

        public IFormFile? ContactFile { get; set; }
    }

    public class VendorBankDetailDto
    {
        public int Id { get; set; }
        public string? BankName { get; set; }
        public string? BankAddress { get; set; }
        public string? EmailAddress { get; set; }
        public string? AccountNo { get; set; }
        public string? IFSCCode { get; set; }
        public string? AccountHolderName { get; set; }
        public string? SwiftCode { get; set; }
        public string? IBANNo { get; set; }
    }
}
