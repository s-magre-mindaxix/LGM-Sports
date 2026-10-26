namespace PayrollManagementAPI.DTO.LoanApplication
{
    public class LoanRecoveryReportItemDto
    {
        public int LoanId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string LoanTypeName { get; set; }
        public decimal TotalLoanAmount { get; set; }
        public decimal TotalAmountPaid { get; set; }
        public decimal BalanceAmount { get; set; }
        public string Status { get; set; }
    }
}
