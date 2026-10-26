using PayrollManagementAPI.DTO.LeaveDetails;
using CompanyPlatform.Core.Models;
namespace PayrollManagementAPI.Services.Leave
{
    public interface ILeaveService
    {
        Task<List<LeaveBalanceDto>> GetLeaveBalanceAsync(int employeeId, int year);
        Task<LeaveRequest> ApplyForLeaveAsync(LeaveRequestCreateDto leaveRequestDto);
        Task<List<LeaveRequestViewDto>> GetLeaveHistoryAsync(int employeeId);
        Task<List<LeaveRequestViewDto>> GetPendingApprovalsAsync(int managerId);
        Task<LeaveRequest> UpdateLeaveStatusAsync(int leaveRequestId, string status, int approvedByEmployeeId);
        Task<List<LeaveRequestViewDto>> GetFilteredTeamLeaveHistoryAsync(int requesterId, bool isAdmin, string role);

        Task<List<EmployeeLeaveBalanceReportDto>> GetAllEmployeesLeaveBalancesAsync(int financialYear, int requesterId, bool isAdmin);
    }
}
