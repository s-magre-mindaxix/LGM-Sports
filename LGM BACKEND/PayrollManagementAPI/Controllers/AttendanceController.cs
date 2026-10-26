using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO.Attendance;
using PayrollManagementAPI.Services.Attendance;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;
        private readonly ILogger<AttendanceController> _logger;

        public AttendanceController(IAttendanceService attendanceService, ILogger<AttendanceController> logger)
        {
            _attendanceService = attendanceService;
            _logger = logger;
        }

        [HttpPost("manual")]
        public async Task<IActionResult> AddManualAttendance([FromBody] CreateAttendanceDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var result = await _attendanceService.AddManualAttendanceAsync(createDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding manual attendance for EmployeeId: {EmployeeId}", createDto.EmployeeId);
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAttendanceByDate([FromQuery] DateTime? date)
        {
            var queryDate = date ?? DateTime.Today;
            try
            {
                var records = await _attendanceService.GetAttendanceByDateAsync(queryDate, User);
                return Ok(records);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching attendance for date: {Date}", queryDate.ToShortDateString());
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("by-employee")]
        public async Task<IActionResult> GetAttendanceByEmployee([FromQuery] int employeeId, [FromQuery] DateTime date)
        {
            if (employeeId <= 0)
            {
                return BadRequest("A valid employeeId is required.");
            }

            var record = await _attendanceService.GetAttendanceByEmployeeAndDateAsync(employeeId, date);

            if (record == null)
            {
                return Ok(null);
            }

            return Ok(record);
        }

        [HttpPost("biometric-punch")]
        [AllowAnonymous] // IMPORTANT: Allows the console app to call it without needing a login token
        public async Task<IActionResult> ReceiveBiometricPunch([FromBody] BiometricPunchDto punchDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _attendanceService.ProcessBiometricPunchAsync(punchDto.EmployeeCode, punchDto.PunchTime, punchDto.DeviceId);

                return Ok("Punch received successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Biometric punch rejected for unknown EmployeeCode.");
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing biometric punch for EmployeeCode: {EmployeeCode}", punchDto.EmployeeCode);
                return StatusCode(500, "An internal server error occurred while processing the punch.");
            }
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> AddBulkAttendance([FromBody] BulkAttendanceDto bulkDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                await _attendanceService.ProcessBulkAttendanceAsync(bulkDto);
                return Ok(new { message = "Bulk attendance processed successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing bulk attendance for EmployeeId: {EmployeeId}", bulkDto.EmployeeId);
                return StatusCode(500, "An internal error occurred.");
            }
        }

    }
}
