using System.ComponentModel;

namespace PayrollManagementAPI.DTO.LeaveDetails
{
    public class LeaveRequestCreateDto
    {
        public int EmployeeID { get; set; }
        public int LeaveTypeID { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public DateTime AppliedDate { get; set; }
        public string Reason { get; set; }
        public decimal Days { get; set; }
        [DefaultValue(false)]
        public bool IsHalfDay { get; set; }
        public string? HalfDayPeriod { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
