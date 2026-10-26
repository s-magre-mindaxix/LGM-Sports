using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.Attendance
{
    public class BulkAttendanceDto
    {
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public DateTime FromDate { get; set; }

        [Required]
        public DateTime ToDate { get; set; }

        // We only care about the Time part of these DateTimes
        public DateTime? InTime { get; set; }
        public DateTime? OutTime { get; set; }

        public string? Notes { get; set; }
    }
}
