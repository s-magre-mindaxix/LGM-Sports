using Microsoft.AspNetCore.Http;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO
{

    public class RegisterEmployeeDto
    {
        // STEP 1: Basic Details
        [Required] public string EmployeeCode { get; set; }
        [Required] public string FirstName { get; set; }
        public string? MiddleName { get; set; }
        [Required] public string LastName { get; set; }
        public int? CompanyId { get; set; }
        public int? DepartmentID { get; set; }
        public int? DesignationID { get; set; }

        public int? LevelID { get; set; }
        public string PANNumber { get; set; }
        public string? PassportNumber { get; set; }
        public string AadhaarNumber { get; set; }
        public IFormFile? Photo { get; set; }
        public List<IFormFile>? Attachments { get; set; } 

        // STEP 2: Current Address
        public string? CurFlatNo { get; set; }
        public string? CurPremisesName { get; set; }
        public string? CurRoadName { get; set; }
        public string? CurLocality { get; set; }
        public string? CurTownDistrict { get; set; }
        public string? CurPinNo { get; set; }
        public int? CurCountryId { get; set; }
        public int? CurStateId { get; set; }
        public string? CurMobileNo { get; set; }
        public string? CurAltMobileNo { get; set; }
        public string? CurEmail { get; set; }
        public string? CurAltEmail { get; set; }

        // STEP 3: Permanent Address
        public string? PermFlatNo { get; set; }
        public string? PermPremisesName { get; set; }
        public string? PermRoadName { get; set; }
        public string? PermLocality { get; set; }
        public string? PermTownDistrict { get; set; }
        public string? PermPinNo { get; set; }
        public int? PermCountryId { get; set; }
        public int? PermStateId { get; set; }
        public string? PermMobileNo { get; set; }
        public string? PermAltMobileNo { get; set; }
        public string? PermEmail { get; set; }
        public string? PermAltEmail { get; set; }

        // STEP 4: Bank Details
        public string? BankName { get; set; }
        public string? BankAddress { get; set; }
        public string? SortCode { get; set; }
        public string? AccountNumber { get; set; }
        public string? IFSCCode { get; set; }
        public string? AccountHolderName { get; set; }
        public string? BeneficiaryName { get; set; }
        public string? SwiftCode { get; set; }
        public string? IBANNo { get; set; }

        // Payroll Defaults (Sent as nullable from CRM)
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfJoining { get; set; }
        public int? WorkLocationID { get; set; }
        public int? ReportingTo { get; set; }
        public string? UANNo { get; set; }
        public string? PFNo { get; set; }
        public string? ESINo { get; set; }

        // Auth
        [Required] public string Email { get; set; }
        [Required] public string Password { get; set; }
        public string? Role { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public string? QualificationsJson { get; set; } // Will receive stringified array from React
        public string? ExperiencesJson { get; set; }
    }

    public class QualificationSubDto
    {
        public string Degree { get; set; }
        public string University { get; set; }
        public string PassingYear { get; set; }
        public decimal Percentage { get; set; }
    }

    public class ExperienceSubDto
    {
        public string CompanyName { get; set; }
        public string Designation { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? Location { get; set; }
    }
}
