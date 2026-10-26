namespace PayrollManagementAPI.DTO.LoanApplication
{
    public class OverdueLoanDto
    {
        public int LoanId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string LoanTypeName { get; set; }
        public decimal LoanAmount { get; set; }
        public decimal MonthlyDeduction { get; set; }
        public int ExpectedInstallments { get; set; }
        public int PaidInstallments { get; set; }
        public decimal OverdueAmount { get; set; }
        public DateTime? LastPaymentDate { get; set; }
    }
}
