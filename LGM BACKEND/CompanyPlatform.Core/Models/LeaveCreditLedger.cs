using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using CompanyPlatform.Core.Models.CRM.Employee;

namespace CompanyPlatform.Core.Models
{
    [Table("tbl_LeaveCreditLedger")]
    public class LeaveCreditLedger
    {
        [Key]
        public int ID { get; set; }

        [Required]
        public int EmployeeID { get; set; }
        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }

        [Required]
        public int LeaveTypeID { get; set; }
        [ForeignKey("LeaveTypeID")]
        public virtual LeaveType LeaveType { get; set; }

        [Required]
        [Column(TypeName = "decimal(5, 2)")]
        public decimal Credit { get; set; }

        [Required]
        public DateTime EarnedDate { get; set; }

        [Required]
        public DateTime ExpiryDate { get; set; }

        public int? LeaveRequestID { get; set; }
        [ForeignKey("LeaveRequestID")]
        public virtual LeaveRequest LeaveRequest { get; set; }

        public int? AttendanceID { get; set; }
        [ForeignKey("AttendanceID")]
        public virtual Attendance Attendance { get; set; }

        public string Notes { get; set; }
    }
}
