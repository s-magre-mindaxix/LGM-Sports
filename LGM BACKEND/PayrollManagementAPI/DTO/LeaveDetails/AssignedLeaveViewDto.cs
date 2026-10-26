using System.ComponentModel;

namespace PayrollManagementAPI.DTO.LeaveDetails
{
    public class AssignedLeaveViewDto
    {
        public int AssignLeaveTypeID { get; set; }
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; }
        public string LeaveTypeName { get; set; }
        public decimal AllocatedDays { get; set; }
        public int FinancialYear { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}

