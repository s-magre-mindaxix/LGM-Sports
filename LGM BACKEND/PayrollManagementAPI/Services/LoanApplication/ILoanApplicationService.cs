using PayrollManagementAPI.DTO.LoanApplication;

namespace PayrollManagementAPI.Services.LoanApplication
{
    public interface ILoanApplicationService
    {
        Task<LoanApplicationViewDto> CreateLoanApplicationAsync(LoanApplicationCreateDto dto);
        Task<List<LoanApplicationViewDto>> GetLoanHistoryByEmployeeIdAsync(int employeeId);
        Task<List<LoanApplicationViewDto>> GetPendingLoanApprovalsAsync(int managerId);
        Task<bool> UpdateLoanStatusAsync(int loanApplicationId, LoanStatusUpdateDto dto);
        Task<LoanDashboardDto> GetDashboardAsync(int? managerId = null);
        Task<LoanDashboardStatsDto> GetDashboardStatsAsync(int userId, string role);
        Task<List<LoanTypeSummaryDto>> GetLoanTypeSummaryAsync(int userId, string role);
        Task<List<LoanRecoveryReportItemDto>> GenerateRecoveryReportAsync();
        Task<List<OverdueLoanDto>> GetOverdueLoansAsync();
        Task<LoanDashboardDto> GetEmployeeDashboardAsync(int employeeId);
        Task<List<LoanApplicationViewDto>> GetTeamLoanHistoryAsync(int managerId);


    }
}
