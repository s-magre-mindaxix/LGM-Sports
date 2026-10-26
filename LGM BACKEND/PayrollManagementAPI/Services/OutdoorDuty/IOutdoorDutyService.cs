using PayrollManagementAPI.DTO.OutdoorDuty;

namespace PayrollManagementAPI.Services.OutdoorDuty
{
    public interface IOutdoorDutyService
    {
        Task<OutdoorDutyViewDto> CreateODAsync(CreateOutdoorDutyDto odDto, int employeeId);
        Task<IEnumerable<OutdoorDutyViewDto>> GetODsByEmployeeIdAsync(int employeeId);
        Task<IEnumerable<OutdoorDutyViewDto>> GetPendingODsForManagerAsync(int managerId);
        Task<OutdoorDutyViewDto> UpdateODStatusAsync(int odId, UpdateODStatusDto statusDto, int managerId);
        Task<IEnumerable<OutdoorDutyViewDto>> GetAllProcessedODsAsync();
    }
}
