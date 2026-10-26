namespace PayrollManagementAPI.DTO.LoanApplication
{
    public class LoanApplicationViewDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }

        public string EmployeeCode { get; set; }
        public int LoanTypeId { get; set; }
        public string LoanTypeName { get; set; }

        public string EmployeeName { get; set; } 
        public decimal LoanAmount { get; set; }
        public int TenureInMonths { get; set; }
        public decimal MonthlyDeduction { get; set; }
        public DateTime ApplicationDate { get; set; }
        public string Status { get; set; }
    }
}
