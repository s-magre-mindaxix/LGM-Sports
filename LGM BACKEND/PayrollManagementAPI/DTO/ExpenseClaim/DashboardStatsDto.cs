namespace PayrollManagementAPI.DTO.ExpenseClaim
{
    public class DashboardStatsDto
    {
        public int PendingClaims { get; set; }
        public decimal ApprovedAmount { get; set; }
        public int ProcessedClaims { get; set; }
        public int RejectedClaims { get; set; }
        public List<ExpenseCategoryStatDto> ExpenseCategories { get; set; }
    }
}
