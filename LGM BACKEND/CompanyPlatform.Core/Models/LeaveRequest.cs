using CompanyPlatform.Core.Models.CRM.Employee;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_LeaveRequest")]
    public class LeaveRequest
    {
        [Key]
        public int ID { get; set; }

        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public Employees Employee { get; set; }

        public int LeaveTypeID { get; set; }
        [ForeignKey("LeaveTypeID")]
        public LeaveType LeaveType { get; set; }

        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        [Required]
        [Column(TypeName = "decimal(5, 2)")]
        public decimal Days { get; set; }
        public string Reason { get; set; }
        public string Status { get; set; } 

        public int? ApprovedByEmployeeID { get; set; }
        public DateTime AppliedDate { get; set; }
        public bool IsHalfDay { get; set; } = false;
        public string? HalfDayPeriod { get; set; }

        [DefaultValue(false)]
        public bool IsDeleted { get; set; }

    }
}
