using CompanyPlatform.Core.DTO.Designation;

namespace CompanyPlatform.Core.Services.Designation
{
    public interface IDesignationService
    {
        Task<IEnumerable<DesignationDto>> GetAllDesignationsAsync();
        Task<DesignationDto> GetDesignationByIdAsync(int id);
        Task<DesignationDto> CreateDesignationAsync(DesignationDto designationDto);
        Task<bool> UpdateDesignationAsync(int id, DesignationDto designationDto);
        Task<bool> DeleteDesignationAsync(int id);
    }
}
