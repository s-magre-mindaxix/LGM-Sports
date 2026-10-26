using System.ComponentModel;

namespace PayrollManagementAPI.DTO.LeaveType
{
    public class LeaveTypeViewDto
    {
        public int ID { get; set; }
        public string LeaveTypeName { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
