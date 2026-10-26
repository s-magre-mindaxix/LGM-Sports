namespace CompanyPlatform.CRM.DTO.PaymentTerm
{
    public class PaymentTermDto
    {
        public int PaymentTermId { get; set; }

        public string PaymentTermName { get; set; }

        public string PaymentTermCode { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}