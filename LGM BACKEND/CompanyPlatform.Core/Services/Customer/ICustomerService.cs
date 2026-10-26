
using CompanyPlatform.CRM.DTO.Customer;

namespace CompanyPlatform.Core.Services.CRM
{
    public interface ICustomerService
    {
        Task<IEnumerable<CustomerResponseDto>> GetAllAsync();

        Task<CustomerResponseDto?> GetByIdAsync(int id);

        Task<CustomerResponseDto> CreateAsync(
            CreateCustomerDto dto);

        Task<bool> UpdateAsync(
            int id, UpdateCustomerDto dto);

        Task<string> GenerateCustomerCodeAsync();
        Task<bool> DeleteAsync(int id);
    }
}

