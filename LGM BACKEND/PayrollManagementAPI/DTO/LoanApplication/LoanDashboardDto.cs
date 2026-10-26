namespace PayrollManagementAPI.DTO.LoanApplication
{
    public class LoanTypeSummaryDto
    {
      
            public int LoanTypeId { get; set; }
            public string LoanTypeName { get; set; }
            public int TotalLoans { get; set; }
            public decimal TotalAmount { get; set; }
        
    }

    public class LoanDashboardDto
    {
        public int ActiveLoansCount { get; set; }
        public decimal ActiveLoansTotalAmount { get; set; }
        public decimal MonthlyRecoveryAmount { get; set; }
        public int PendingApprovalsCount { get; set; }
        public List<LoanTypeSummaryDto> LoanTypes { get; set; }
    }
}
