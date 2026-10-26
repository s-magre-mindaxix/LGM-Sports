namespace CompanyPlatform.Core.DTO.Company
{
    public class CompanyBankDetailDto
    {
        public int BankDetailId { get; set; }
        public int CompanyId { get; set; }
        public string BankName { get; set; }
        public string? BankAddress { get; set; }
        public string AccountNo { get; set; }
        public string IFSC { get; set; }
        public string? SwiftCode { get; set; }
        public string? IBAN { get; set; }
        public string AccountHolderName { get; set; }
    }
}