using PayrollManagementAPI.DTO.LeaveType;

namespace PayrollManagementAPI.Services.LeaveType
{
    public interface ILeaveTypeService
    {
        Task<IEnumerable<LeaveTypeViewDto>> GetAllLeaveTypesAsync();
        Task<LeaveTypeViewDto> GetLeaveTypeByIdAsync(int id);
        Task<LeaveTypeViewDto> CreateLeaveTypeAsync(LeaveTypeCreateDto leaveTypeDto);
        Task<bool> UpdateLeaveTypeAsync(int id, LeaveTypeCreateDto leaveTypeDto);
        Task<bool> DeleteLeaveTypeAsync(int id);
    }
}
