using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.Attendance
{
    public class BiometricPunchDto
    {
        [Required]
        public string EmployeeCode { get; set; }

        [Required]
        public DateTime PunchTime { get; set; }

        public string? DeviceId { get; set; }
    }
}
