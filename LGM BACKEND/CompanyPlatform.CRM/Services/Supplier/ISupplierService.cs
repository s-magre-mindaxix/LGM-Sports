
using CompanyPlatform.Core.DTO.CRM.Supplier;

namespace CompanyPlatform.Core.Services.CRM
{
    public interface ISupplierService
    {
        Task<IEnumerable<SupplierResponseDto>> GetAllAsync();

        Task<SupplierResponseDto?> GetByIdAsync(int id);

        Task<SupplierResponseDto> CreateAsync(
            CreateSupplierDto dto);

        Task<SupplierResponseDto?> UpdateAsync(
            int id,
            UpdateSupplierDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
