namespace PayrollManagementAPI.DTO.Payroll
{
    public class PendingLeaveRequestDto
    {
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; }
        public string LeaveTypeName { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public decimal Days { get; set; }
        public string ReportingManagerName { get; set; } 
    }
}
