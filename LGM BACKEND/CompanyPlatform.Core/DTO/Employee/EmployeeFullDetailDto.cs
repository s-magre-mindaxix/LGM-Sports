using CompanyPlatform.Core.DTO.EmployeePFDetails;
using CompanyPlatform.Core.DTO.EmployeeTDSDetails;

namespace CompanyPlatform.Core.DTO.Employee
{
    // A simple DTO for the nested statutory details
    public class ViewStatutoryDetailsDto
    {
        public string AadhaarNumber { get; set; }
        public string PANNumber { get; set; }
        public string? PassportNumber { get; set; }
        public string UANNo { get; set; }
        public string PFNo { get; set; }
        public string ESINo { get; set; }
    }

    // A simple DTO for the nested bank details
    public class ViewBankDetailsDto
    {
        public string AccountHolderName { get; set; }
        public string BankName { get; set; }
        public string AccountNumber { get; set; }
        public string IFSCCode { get; set; }
        public string? SwiftCode { get; set; }
        public string? IBANNo { get; set; }
        public string? BankAddress { get; set; }
        public string? SortCode { get; set; }
    }

    // A simple DTO for the nested document list
    public class ViewDocumentDto
    {
        public int Id { get; set; }
        public string DocumentName { get; set; }
        public string FilePath { get; set; }
        public DateTime UploadedDate { get; set; }
    }

    // The main DTO that combines everything
    public class EmployeeFullDetailDto
    {
        public int ID { get; set; }
        public string EmployeeCode { get; set; }
        public string FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }

        public string? GoogleCalendarId { get; set; }
        public string MobileNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime? DateOfJoining { get; set; }

        public string Role { get; set; }
        public string Gender { get; set; }
        public string WorkLocationName { get; set; }
        public string DepartmentName { get; set; }
        public string DesignationName { get; set; }

        public int? LevelID { get; set; }
        public string LevelName { get; set; }
        public string? ReportingToName { get; set; }

        public string? CurFlatNo { get; set; }
        public int? CurCountryId { get; set; }
        public int? CurStateId { get; set; }
        public string? CurPremisesName { get; set; }
        public string? CurRoadName { get; set; }
        public string? CurLocality { get; set; }
        public string? CurTownDistrict { get; set; }
        public string? CurPinNo { get; set; }
        public string? CurCountryName { get; set; }
        public string? CurStateName { get; set; }

        public string? PermFlatNo { get; set; }
        public int? PermCountryId { get; set; }
        public int? PermStateId { get; set; }
        public string? PermPremisesName { get; set; }
        public string? PermRoadName { get; set; }
        public string? PermLocality { get; set; }
        public string? PermTownDistrict { get; set; }
        public string? PermPinNo { get; set; }
        public string? PermCountryName { get; set; }
        public string? PermStateName { get; set; }

        public bool IsActive { get; set; }

        public int? CompanyId { get; set; }
        public int? DepartmentID { get; set; }
        public int? DesignationID { get; set; }
        public int? WorkLocationID { get; set; }
        public string? CompanyName { get; set; }
        public string? PhotoPath { get; set; }

        public ViewStatutoryDetailsDto StatutoryDetails { get; set; }
        public ViewBankDetailsDto BankDetails { get; set; }
        public List<ViewDocumentDto> Documents { get; set; } = new();
        public ViewPFDetailsDto? PFDetails { get; set; }
        public ViewTDSDetailsDto? TDSDetails { get; set; }

        public List<QualificationResponseDto> Qualifications { get; set; } = new();
        public List<ExperienceResponseDto> Experiences { get; set; } = new();
    }

    public class QualificationResponseDto
    {
        public string Degree { get; set; }
        public string University { get; set; }
        public string PassingYear { get; set; }
        public decimal Percentage { get; set; }
    }

    public class ExperienceResponseDto
    {
        public string CompanyName { get; set; }
        public string Designation { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? Location { get; set; }
    }
}
