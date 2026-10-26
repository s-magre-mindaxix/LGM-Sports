using Microsoft.AspNetCore.Http;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.Employee
{
    public class UpdateEmployeeDto
    {
        [Required] public string EmployeeCode { get; set; }
        [Required] public string FirstName { get; set; }
        public string? MiddleName { get; set; }
        [Required] public string LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? MobileNumber { get; set; }
        public string? PresentAddress { get; set; }
        public int? WorkLocationID { get; set; }
        public int? DepartmentID { get; set; }
        public int? DesignationID { get; set; }

        public int? LevelID { get; set; }

        public string? GoogleCalendarId { get; set; }
        public int? ReportingTo { get; set; }
        public int? CompanyId { get; set; }
        public IFormFile? Photo { get; set; }
        public bool IsActive { get; set; }
        public string Role { get; set; }

        // --- NEW ADDRESS FIELDS ---
        public string? CurFlatNo { get; set; }
        public string? CurPremisesName { get; set; }
        public string? CurRoadName { get; set; }
        public string? CurLocality { get; set; }
        public string? CurTownDistrict { get; set; }
        public string? CurPinNo { get; set; }
        public int? CurCountryId { get; set; }
        public int? CurStateId { get; set; }
        public string? CurMobileNo { get; set; }
        public string? CurEmail { get; set; }

        public string? PermFlatNo { get; set; }
        public string? PermPremisesName { get; set; }
        public string? PermRoadName { get; set; }
        public string? PermLocality { get; set; }
        public string? PermTownDistrict { get; set; }
        public string? PermPinNo { get; set; }
        public int? PermCountryId { get; set; }
        public int? PermStateId { get; set; }
        public string? PermMobileNo { get; set; }
        public string? PermEmail { get; set; }

        // --- NEW BANK FIELDS ---
        public string? BankName { get; set; }
        public string? BankAddress { get; set; }
        public string? SortCode { get; set; }
        public string? AccountNumber { get; set; }
        public string? IFSCCode { get; set; }
        public string? AccountHolderName { get; set; }
        public string? SwiftCode { get; set; }
        public string? IBANNo { get; set; }
        public string? PANNumber { get; set; }
        public string? AadhaarNumber { get; set; }
        public string? PassportNumber { get; set; }
        // --- JSON STRINGS FOR LISTS ---
        public string? QualificationsJson { get; set; }
        public string? ExperiencesJson { get; set; }

        public decimal? PFDeductionPercentage { get; set; }
        public bool IsCappedAt15k { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }

    public class UpdateEmployeeStatusDto
    {
        public bool IsActive { get; set; }
    }
}
