namespace PayrollManagementAPI.DTO.Payroll
{
    public class AttendanceExceptionDto
    {
        public int EmployeeID { get; set; }

        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; } 
        public DateTime Date { get; set; }
        public string Issue { get; set; } 
    }

    public class AttendanceCheckResultDto
    {
        public List<AttendanceExceptionDto> Exceptions { get; set; }
        public int TotalAttendanceRecordsInMonth { get; set; }
    }
}
