namespace PayrollManagementAPI.DTO.LeaveDetails
{
    public class EmployeeLeaveBalanceReportDto
    {
        public int EmployeeID { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string Department { get; set; }
        public List<LeaveBalanceDto> Balances { get; set; }
    }
}
