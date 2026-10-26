using PayrollManagementAPI.DTO.ExpenseClaim;

namespace PayrollManagementAPI.Services.ExpenseClaim
{
    public interface IExpenseClaimService
    {
        Task<ExpenseClaimViewDto> CreateClaimAsync(CreateExpenseClaimDto claimDto, int employeeId);
        Task<IEnumerable<ExpenseClaimViewDto>> GetClaimsByEmployeeIdAsync(int employeeId);
        Task<IEnumerable<ExpenseClaimViewDto>> GetPendingClaimsForManagerAsync(int managerId);
        Task<ExpenseClaimViewDto> UpdateClaimStatusAsync(int claimId, UpdateExpenseStatusDto statusDto, int managerId);
        Task<DashboardStatsDto> GetDashboardStatsAsync(int employeeId, bool isAdminOrHr);
        Task<IEnumerable<ExpenseClaimViewDto>> GetAllProcessedClaimsAsync();
        Task<byte[]> GenerateExpenseReportAsync(DateTime startDate, DateTime endDate);
        Task<int> BulkApproveClaimsAsync(List<int> claimIds, int managerId);
    }
}
