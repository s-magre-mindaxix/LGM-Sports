using CompanyPlatform.CRM.DTO.PaymentTerm;

namespace CompanyPlatform.CRM.Services.PaymentTerm
{
    public interface IPaymentTermService
    {
        Task<IEnumerable<PaymentTermDto>> GetAllPaymentTermsAsync();

        Task<PaymentTermDto> GetPaymentTermByIdAsync(int id);

        Task<PaymentTermDto> CreatePaymentTermAsync(PaymentTermDto paymentTermDto);

        Task<bool> UpdatePaymentTermAsync(int id, PaymentTermDto paymentTermDto);

        Task<bool> DeletePaymentTermAsync(int id);
    }
}