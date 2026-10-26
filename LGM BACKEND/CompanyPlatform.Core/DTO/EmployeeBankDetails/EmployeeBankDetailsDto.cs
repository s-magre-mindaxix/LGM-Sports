namespace CompanyPlatform.Core.DTO.EmployeeBankDetails
{
    public class EmployeeBankDetailsDto
    {
        public int ID { get; set; }
        public string AccountHolderName { get; set; }
        public string BankName { get; set; }
        public string AccountNumber { get; set; }
        public string IFSCCode { get; set; }
        public int EmployeeID { get; set; }
        public bool IsDeleted { get; set; }

    }
}
