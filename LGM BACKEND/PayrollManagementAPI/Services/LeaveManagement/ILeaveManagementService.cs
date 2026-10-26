using PayrollManagementAPI.DTO.LeaveDetails;

namespace PayrollManagementAPI.Services.LeaveManagement
{
    public interface ILeaveManagementService
    {
        Task<string> AccrueYearlyEarnLeavesFromPreviousYearAsync(int yearToCredit, int yearToScan);
        Task<string> AllocateLeavesToAllEmployeesAsync(LeaveAllocationDto dto);
        Task<List<AssignedLeaveViewDto>> GetAllocatedLeavesForYearAsync(int financialYear);

        Task<string> UpdateAllocatedLeaveAsync(int assignLeaveTypeId, decimal newAllocatedDays);
    }
}
