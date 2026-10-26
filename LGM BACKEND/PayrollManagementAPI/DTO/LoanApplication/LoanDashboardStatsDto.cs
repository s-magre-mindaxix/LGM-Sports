namespace PayrollManagementAPI.DTO.LoanApplication
{
    public class LoanDashboardStatsDto
    {
        public int ActiveLoanCount { get; set; }
        public decimal TotalOutstandingAmount { get; set; }
        public decimal MonthlyRecovery { get; set; }
        public int PendingApprovals { get; set; }
    }
}
