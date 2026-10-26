namespace PayrollManagementAPI.DTO
{
    public class SalaryDashboardStatsDto
    {
        public int TotalStructures { get; set; } 

        public int EmployeesMapped { get; set; }
        public decimal AvgBasicPay { get; set; }
        public int PendingUpdates { get; set; }
        // You can add more stats as needed
    }
}
