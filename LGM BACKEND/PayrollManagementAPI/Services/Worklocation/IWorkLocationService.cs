using PayrollManagementAPI.DTO.WorkLocation;

namespace PayrollManagementAPI.Services.Worklocation
{
    public interface IWorkLocationService
    {
        Task<IEnumerable<WorkLocationDto>> GetAllLocationsAsync();
        Task<WorkLocationDto> GetLocationByIdAsync(int id);
        Task<WorkLocationDto> CreateLocationAsync(WorkLocationDto locationDto);
        Task<bool> UpdateLocationAsync(int id, WorkLocationDto locationDto);
        Task<bool> DeleteLocationAsync(int id);
    }
}
