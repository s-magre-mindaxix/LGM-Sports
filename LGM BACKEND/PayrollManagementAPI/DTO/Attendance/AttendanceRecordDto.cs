namespace PayrollManagementAPI.DTO.Attendance
{
    public class AttendanceRecordDto
    {
        public string EmployeeName { get; set; }
        public string EmployeeId { get; set; }
        public string Department { get; set; }
        public string Plant { get; set; }
        public InTimeDetails InTime { get; set; }
        public string? OutTime { get; set; }
        public string? TotalHours { get; set; }
        public string Overtime { get; set; }
        public string Status { get; set; }
    }

    public class InTimeDetails
    {
        public string? Time { get; set; }
        public string? LateInfo { get; set; }
    }
}
