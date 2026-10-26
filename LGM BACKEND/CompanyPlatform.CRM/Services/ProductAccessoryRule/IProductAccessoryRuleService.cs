
using CompanyPlatform.CRM.DTO.ProductAccessoryRule;

namespace CompanyPlatform.CRM.Services.ProductAccessoryRule
{
    public interface IProductAccessoryRuleService
    {
        Task<List<ProductAccessoryRuleDto>> GetAllAsync();

        Task<ProductAccessoryRuleDto?> GetByIdAsync(int id);

        Task<int> CreateAsync(ProductAccessoryRuleDto dto);

        Task<bool> UpdateAsync(ProductAccessoryRuleDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
