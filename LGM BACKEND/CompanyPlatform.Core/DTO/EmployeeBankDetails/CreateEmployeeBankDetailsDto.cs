using System.ComponentModel;

namespace CompanyPlatform.Core.DTO.EmployeeBankDetails
{
    public class CreateEmployeeBankDetailsDto
    {
        public string AccountHolderName { get; set; }
        public string BankName { get; set; }
        public string AccountNumber { get; set; }
        public string IFSCCode { get; set; }
        public int EmployeeID { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
