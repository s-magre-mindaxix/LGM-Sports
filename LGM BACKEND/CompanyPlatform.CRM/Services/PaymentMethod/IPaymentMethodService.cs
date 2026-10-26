
using CompanyPlatform.CRM.DTO.PaymentMethod;

namespace CompanyPlatform.CRM.Services.PaymentMethod
{
    public interface IPaymentMethodService
    {
        Task<IEnumerable<PaymentMethodDto>> GetAllAsync();

        Task<PaymentMethodDto?> GetByIdAsync(int id);

        Task<PaymentMethodDto> CreateAsync(
            PaymentMethodDto dto);

        Task<bool> UpdateAsync(
            int id, PaymentMethodDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
