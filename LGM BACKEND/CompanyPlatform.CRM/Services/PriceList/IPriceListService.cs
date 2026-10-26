
using CompanyPlatform.CRM.DTO.PriceList;

namespace CompanyPlatform.CRM.Services.PriceList
{
    public interface IPriceListService
    {
        Task<IEnumerable<PriceListDto>> GetAllAsync();

        Task<PriceListDto?> GetByIdAsync(int id);

        Task<PriceListDto> CreateAsync(PriceListDto dto);

        Task<bool> UpdateAsync(int id, PriceListDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
