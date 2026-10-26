using PayrollManagementAPI.DTO.Attendance;
using System.Security.Claims;

namespace PayrollManagementAPI.Services.Attendance
{
    public interface IAttendanceService
    {
        Task<AttendanceRecordDto> AddManualAttendanceAsync(CreateAttendanceDto createDto);
        Task<IEnumerable<AttendanceRecordDto>> GetAttendanceByDateAsync(DateTime date, ClaimsPrincipal user);
        Task<AttendanceRecordDto> GetAttendanceByEmployeeAndDateAsync(int employeeId, DateTime date);
        Task ProcessBiometricPunchAsync(string biometricId, DateTime punchTime, string deviceId);
        Task MarkAbsenteesAsync();

        Task ProcessBulkAttendanceAsync(BulkAttendanceDto bulkDto);
    }
}
