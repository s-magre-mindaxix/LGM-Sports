using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.PaySlip;
using PayrollManagementAPI.Services.Email;
using PayrollManagementAPI.Services.PaySlip;
using CompanyPlatform.Core.Services.Email;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PayslipController : ControllerBase
    {
        private readonly IPayslipService _payslipService;
        private readonly ApplicationDBContext _context;
        private readonly IEmailService _emailService;

        public PayslipController(IPayslipService payslipService , ApplicationDBContext context, IEmailService emailService)
        {
            _payslipService = payslipService;
            _context = context;
            _emailService = emailService;
        }

      
        [Authorize(Roles = "Admin,HR")]
        [HttpPost("generate-all/{payrollRunId}")] 
        public async Task<IActionResult> GenerateAll(int payrollRunId)
        {
            var list = await _payslipService.GenerateAllPayslipsAsync(payrollRunId);
            return Ok(list);
        }

        [Authorize(Roles = "Admin,HR")]
        [HttpGet("run/{payrollRunId}")]
        public async Task<IActionResult> GetAllPayslips(int payrollRunId)
        {
            return Ok(await _payslipService.GetAllPayslipsForRunAsync(payrollRunId));
        }

        [Authorize(Roles = "Admin,HR")]
        [HttpGet("summary/{payrollRunId}")]
        public async Task<IActionResult> Summary(int payrollRunId)
        {
            return Ok(await _payslipService.GetPayslipSummaryAsync(payrollRunId));
        }

       
        [Authorize]
        [HttpGet("download/{payslipId}")]
        public async Task<IActionResult> Download(int payslipId)
        {
            var role = User.FindFirst("role")?.Value;

            var empIdClaim = User.FindFirst("EmployeeId")?.Value;

            if (string.IsNullOrEmpty(empIdClaim) || !int.TryParse(empIdClaim, out var empId))
            {
                return Unauthorized("EmployeeId claim is missing or invalid in the token.");
            }

            var bytes = await _payslipService.DownloadPayslipAsync(payslipId, empId, role);
            if (bytes == null) return NotFound("Payslip file not found or you do not have permission.");

            return File(bytes, "application/pdf", $"Payslip_{payslipId}.pdf");
        }

        [Authorize(Roles = "Employee")]
        [HttpGet("history/{employeeId}")] 
        public async Task<IActionResult> History(int employeeId)
        {
            var loggedInEmpIdClaim = User.FindFirst("EmployeeId")?.Value;

            if (string.IsNullOrEmpty(loggedInEmpIdClaim) || !int.TryParse(loggedInEmpIdClaim, out var loggedInEmpId))
            {
                return Unauthorized("EmployeeId claim is missing or invalid in the token.");
            }

            if (loggedInEmpId != employeeId)
            {
                return Forbid(); 
            }

            var history = await _payslipService.GetEmployeePayslipHistoryAsync(employeeId);
            return Ok(history);
        }

        [HttpGet("active-run")]
        [ProducesResponseType(typeof(PayrollRunDto), 200)]
        public async Task<IActionResult> GetActivePayrollRun()
        {
            try
            {
                var activeRun = await _payslipService.GetActivePayrollRunAsync();
                return Ok(activeRun);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }


        [HttpGet("details/{payslipId}")]
        public async Task<IActionResult> GetPayslipsDetails(int payslipId)
        {
            var payslipInfo = await _context.Tbl_Payslips
                .Include(p => p.PayrollRun) 
                .FirstOrDefaultAsync(p => p.Id == payslipId);

            if (payslipInfo == null)
            {
                return NotFound(new { message = "Payslip record not found." });
            }

            var payslipData = await _payslipService.GetPayslipDataAsync(
                payslipInfo.EmployeeID,
                payslipInfo.PayrollRun.Year,
                payslipInfo.PayrollRun.Month
            );

            if (payslipData == null)
            {
                return NotFound(new { message = "Could not retrieve detailed salary data for the payslip." });
            }

            return Ok(payslipData);
        }

        [Authorize]
        [HttpPost("mark-downloaded/{payslipId}")]
        public async Task<IActionResult> MarkAsDownloaded(int payslipId)
        {
            var payslipExists = await _context.Tbl_Payslips.AnyAsync(p => p.Id == payslipId);
            if (!payslipExists)
            {
                return NotFound();
            }

            await _payslipService.MarkAsDownloadedAsync(payslipId);
            return NoContent(); 
        }

        [Authorize(Roles = "Admin,HR")]
        [HttpGet("all-runs")]
        public async Task<IActionResult> GetAllRuns()
        {
            var runs = await _payslipService.GetAllPayrollRunsAsync();
            return Ok(runs);
        }

        [HttpGet("monthly-report")]
        public async Task<IActionResult> GetMonthlyAttendanceReport(int employeeId, int year, int month)
        {
            if (employeeId <= 0 || year < 2000 || month < 1 || month > 12)
            {
                return BadRequest("Invalid input parameters.");
            }

            try
            {
                var report = await _payslipService.GetMonthlyAttendanceAsync(employeeId, year, month);

                if (report == null)
                {
                    return NotFound($"No attendance data found for employee ID {employeeId} for the selected period.");
                }

                return Ok(report);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("monthly-workdays-summary")]
        public async Task<IActionResult> GetMonthlyWorkDaysSummary(int year, int month)
        {
            if (year < 2000 || month < 1 || month > 12)
            {
                return BadRequest("Invalid year or month provided.");
            }

            try
            {
                var result = await _payslipService.GetMonthlyWorkDaysSummaryAsync(year, month);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);   // temporary for debugging
            }
        }

        [HttpGet("employee/{employeeId}/leave-balance")]
        public async Task<IActionResult> GetEmployeeLeaveBalance(int employeeId, [FromQuery] int year, [FromQuery] int month)
        {
            if (year <= 0 || month <= 0 || month > 12)
            {
                return BadRequest("Invalid year or month provided.");
            }

            try
            {
                var leaveBalances = await _payslipService.GetLeaveBalanceForPayslipAsync(employeeId, year, month);

                if (leaveBalances == null || !leaveBalances.Any())
                {
                    return NotFound($"No leave balance information found for employee ID {employeeId} for the specified period.");
                }

                return Ok(leaveBalances);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An internal server error occurred while processing your request.");
            }
        }

        [HttpGet("employee/{employeeId}/advance-balance")]
        public async Task<IActionResult> GetEmployeeAdvanceBalance(int employeeId, [FromQuery] int year, [FromQuery] int month)
        {
            if (year <= 0 || month <= 0 || month > 12)
            {
                return BadRequest("Invalid year or month provided.");
            }

            try
            {
                var advanceBalance = await _payslipService.GetAdvanceBalanceForPayslipAsync(employeeId, year, month);
                return Ok(advanceBalance);
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "An internal server error occurred while processing the advance balance.");
            }
        }

        [Authorize(Roles = "Admin,HR")]
        [HttpPost("send-email-with-attachment")]
        public async Task<IActionResult> SendEmailWithAttachment([FromForm] IFormFile file, [FromForm] int payslipId, [FromForm] int employeeId, [FromForm] int payrollRunId)
        {
            try
            {
                await _payslipService.EmailUploadedPayslipAsync(file, payslipId, employeeId, payrollRunId);

                return Ok(new { message = "Email has been sent successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An internal server error occurred: {ex.Message}");
            }
        }

    }
}

