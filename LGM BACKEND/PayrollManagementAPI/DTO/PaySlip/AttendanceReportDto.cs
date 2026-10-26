namespace PayrollManagementAPI.DTO.PaySlip
{
    public class AttendanceReportDto
    {
        public int EmployeeId { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public int TotalDaysInMonth { get; set; }
        public decimal PresentDays { get; set; }

        public decimal OutdoorDutyDays { get; set; }
        public int WeeklyOffs { get; set; }
        public decimal PaidHolidays { get; set; }
        public decimal EarnedLeave { get; set; }
        public decimal CasualLeave { get; set; }
        public decimal PaidDays { get; set; }

        public decimal CompensatoryOff { get; set; } // To hold the count of C-Off days taken

        public decimal WeeklyOffAndHolidays {  get; set; }
       
        public List<LeaveBreakdown> LeaveDetails { get; set; } = new List<LeaveBreakdown>();
    }

    public class LeaveBreakdown
    {
        public string LeaveType { get; set; }
        public decimal Days { get; set; }
    }

}
