namespace PayrollManagementAPI.DTO.Advance
{
    public class AdvanceViewDto
    {
        public int ID { get; set; }
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; }
        public decimal Amount { get; set; }
        public string RequestDate { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
        public string StatusDate { get; set; }
        public string ProcessedByName { get; set; }
        public decimal TotalRepaid { get; set; }
        public decimal Balance { get; set; }
    }
}
