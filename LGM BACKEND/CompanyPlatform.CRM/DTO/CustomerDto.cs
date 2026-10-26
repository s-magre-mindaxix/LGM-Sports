using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace CompanyPlatform.CRM.DTO
{
    public class CustomerDto
    {
        public int Id { get; set; }

        [Required]
        public string CustomerGroup { get; set; }

        [Required]
        public string CustomerCode { get; set; }

        [Required]
        public string CustomerName { get; set; }

        public string? CustomerShortName { get; set; }
        public string? Branch { get; set; }
        public string? VendorCode { get; set; }
        public string? PlantCode { get; set; }
        public string? FlatNo { get; set; }
        public string? PremisesName { get; set; }
        public string? RoadLane { get; set; }
        public string? AreaLocality { get; set; }
        public string? Town { get; set; }
        public string? District { get; set; }
        public string? PinNo { get; set; }
        public string? State { get; set; }
        public string? Country { get; set; }

        [Required]
        public string MobileNo { get; set; }
        public string? AltMobileNo { get; set; }

        [Required]
        [EmailAddress]
        public string EmailAddress { get; set; }

        [EmailAddress]
        public string? AltEmailAddress { get; set; }
        public string? ResPersonName { get; set; }
        public string? ResPersonDesignation { get; set; }
        public string? ResPersonMobileNo { get; set; }
        public string? ResPersonAltMobileNo { get; set; }
        [EmailAddress]
        public string? ResPersonEmail { get; set; }
        [EmailAddress]
        public string? ResPersonAltEmail { get; set; }
        public string? AltFlatNo { get; set; }
        public string? AltPremisesName { get; set; }
        public string? AltRoadLane { get; set; }
        public string? AltAreaLocality { get; set; }
        public string? AltTown { get; set; }
        [Required]
        public string AltDistrict { get; set; }
        public string? AltPinNo { get; set; }
        public string? AltState { get; set; }
        public string? AltCountry { get; set; }
        public string? AltMobileNo2 { get; set; }
        public string? AltAltMobileNo { get; set; }
        [EmailAddress]
        public string? AltEmailAddress2 { get; set; }
        [EmailAddress]
        public string? AltAltEmailAddress { get; set; }
        [Required]
        public string PerResPersonName { get; set; }
        public string? PerResPersonDesignation { get; set; }
        public string? PerMobileNo { get; set; }
        public string? PerAltMobileNo { get; set; }
        [EmailAddress]
        public string? PerEmailAddress { get; set; }
        [EmailAddress]
        public string? PerAltEmailAddress { get; set; }
        public string? CompanyPan { get; set; }
        public string? CompanyTan { get; set; }
        public string? GstNo { get; set; }
        public string? CinNo { get; set; }
        public string? MsmeNumber { get; set; }
        public IFormFile? DocsAttachmentFile { get; set; }
        public string? DocAttachment { get; set; }
        [Required]
        public string PermanentAddressCheck { get; set; }
    }
}