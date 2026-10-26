using CompanyPlatform.CRM.DTO.DocumentSeries;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.DocumentSeries
{
    public interface IDocumentSeriesService
    {
        Task<IEnumerable<DocumentSeriesDto>> GetAllAsync();
        Task<DocumentSeriesDto?> GetByIdAsync(int id);
        Task<DocumentSeriesDto> CreateAsync(DocumentSeriesDto dto);
        Task<bool> UpdateAsync(int id, DocumentSeriesDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
