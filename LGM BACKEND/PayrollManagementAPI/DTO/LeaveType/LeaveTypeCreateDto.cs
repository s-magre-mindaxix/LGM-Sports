using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.LeaveType
{
    public class LeaveTypeCreateDto
    {
       
        public string LeaveTypeName { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
