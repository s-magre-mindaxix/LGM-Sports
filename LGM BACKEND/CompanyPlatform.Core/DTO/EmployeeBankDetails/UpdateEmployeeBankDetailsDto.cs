using System.ComponentModel;

namespace CompanyPlatform.Core.DTO.EmployeeBankDetails
{
    public class UpdateEmployeeBankDetailsDto
    {
        public string BeneficiaryName { get; set; }
        public string BankName { get; set; }
        public string AccountNumber { get; set; }
        public string IFSCCode { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }


    }
}
