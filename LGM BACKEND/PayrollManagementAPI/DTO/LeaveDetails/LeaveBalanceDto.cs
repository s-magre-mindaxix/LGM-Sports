using System.ComponentModel;

namespace PayrollManagementAPI.DTO.LeaveDetails
{
    public class LeaveBalanceDto
    {
        public string LeaveTypeName { get; set; }
        public decimal AllocatedDays { get; set; }
        public decimal AvailedDays { get; set; }
        public decimal BalanceDays { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }
    }
}
