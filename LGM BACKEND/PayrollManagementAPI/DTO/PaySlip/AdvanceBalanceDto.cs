namespace PayrollManagementAPI.DTO.PaySlip
{
    public class AdvanceBalanceDto
    {
        public decimal OpeningBalance { get; set; }
        public decimal NewAdvanceTakenThisMonth { get; set; }
        public decimal ClosingBalance { get; set; }
    }
}
