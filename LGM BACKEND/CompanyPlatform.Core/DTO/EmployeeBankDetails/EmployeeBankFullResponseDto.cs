using System.ComponentModel;

namespace CompanyPlatform.Core.DTO.EmployeeBankDetails
{
    public class EmployeeBankFullResponseDto
    {
        public EmployeeInfoDto Employee { get; set; }
        public EmployeeBankDetailsDto BankDetails { get; set; }
    }

    public class EmployeeInfoDto
    {
        public int ID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public string MobileNumber { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
