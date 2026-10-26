using System.ComponentModel;

namespace CompanyPlatform.Core.DTO.Employee
{
    public class EmployeeResponseDto
    {
        public int ID { get; set; }
        public string EmployeeCode { get; set; }
        public string FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public string? Gender { get; set; }
        public string MobileNumber { get; set; }
        public DateTime? DateOfJoining { get; set; }
        public DateTime? DateOfLeaving { get; set; }
        
        public int? WorkLocationID { get; set; }
        public int? DepartmentID { get; set; }
        public int? DesignationID { get; set; }
        public bool IsActive { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
