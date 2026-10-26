namespace PayrollManagementAPI.DTO.PaySlip
{
    public class MonthlyWorkDaysDto
    {
        public int StandardWorkingDays { get; set; }
        public int WeeklyOffs { get; set; }
        public int PaidHolidays { get; set; }
        public int TotalDays { get; set; }
    }
}
