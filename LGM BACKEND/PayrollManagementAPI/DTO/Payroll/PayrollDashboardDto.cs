namespace PayrollManagementAPI.DTO.Payroll
{
    public class PayrollDashboardDto
    {
        public string ProcessingMonth { get; set; }
        public int TotalEmployees { get; set; }
        public decimal EstimatedGrossAmount { get; set; }
        public string Status { get; set; }
    }
}
