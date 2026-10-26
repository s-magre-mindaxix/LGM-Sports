using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using CompanyPlatform.Core.Models.CRM.Employee;

namespace CompanyPlatform.Core.Models
{
    public enum AttendanceStatus
    {
        Present,
        Absent,
        HalfDay,
        OnLeave
    }

    [Table("Tbl_Attendance")]
    public class Attendance
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        [ForeignKey("EmployeeID")]
        public virtual Employees Employee { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public DateTime? InTime { get; set; }

        public DateTime? OutTime { get; set; }

        public string? InDeviceID { get; set; }  

        public string? OutDeviceID { get; set; }

        [Required]
        public AttendanceStatus Status { get; set; }

        public string? Notes { get; set; } 

        public bool IsDeleted { get; set; } = false;
    }
}
