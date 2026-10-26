using CompanyPlatform.Core.DTOs.Inventory;

namespace CompanyPlatform.Core.Interfaces.Inventory
{
    public interface ITaxService
    {
        Task<IEnumerable<TaxDto>> GetAllAsync();

        Task<TaxDto?> GetByIdAsync(int id);

        Task<TaxDto> CreateAsync(TaxDto taxDto);

        Task<TaxDto?> UpdateAsync(int id, TaxDto taxDto);

        Task<bool> DeleteAsync(int id);
    }
}