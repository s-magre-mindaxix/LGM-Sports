using CompanyPlatform.Core.Models.CRM.Employee;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_AssignLeaveType")]
    public class AssignLeaveType
    {
        [Key]
        public int ID { get; set; }

        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public Employees Employee { get; set; }

        public int LeaveTypeID { get; set; }
        [ForeignKey("LeaveTypeID")]
        public LeaveType LeaveType { get; set; }

        public decimal AllocatedDays { get; set; }
        public int FinancialYear { get; set; }
        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
