namespace PayrollManagementAPI.DTO.Payroll
{
    public class PayrollHistoryDto
    {
        public int PayrollRunId { get; set; }

        public string Period { get; set; }

        public int Employees { get; set; }

        public decimal GrossAmount { get; set; }

        public decimal NetAmount { get; set; }

        public string Status { get; set; }

        public DateTime ProcessedOn { get; set; }
    }
}
