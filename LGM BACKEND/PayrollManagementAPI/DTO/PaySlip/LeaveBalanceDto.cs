namespace PayrollManagementAPI.DTO.PaySlip
{
    public class LeaveBalanceDto
    {
        public string LeaveTypeName { get; set; }
        public decimal OpeningBalance { get; set; }
        public decimal LeavesTakenThisMonth { get; set; }
        public decimal ClosingBalance { get; set; }
    }
}
