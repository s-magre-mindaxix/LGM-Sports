using System.ComponentModel;

namespace PayrollManagementAPI.DTO.LeaveDetails
{
    public class LeaveRequestViewDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string LeaveTypeName { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
        public decimal Days { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; }
        public DateTime AppliedDate { get; set; }

        public string ApprovedBy { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
