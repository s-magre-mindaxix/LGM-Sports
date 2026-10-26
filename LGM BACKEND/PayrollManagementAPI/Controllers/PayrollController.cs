using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.Payroll;
using PayrollManagementAPI.Services.PayrollProcessing;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PayrollController : ControllerBase
    {
        private readonly IPayrollProcessingService _payrollService;
        private readonly ApplicationDBContext _context;

        public PayrollController(IPayrollProcessingService payrollService, ApplicationDBContext context)
        {
            _payrollService = payrollService;
            _context = context;
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayroll([FromQuery] int year, [FromQuery] int month)
        {
            if (year == 0 || month < 1 || month > 12)
            {
                return BadRequest("Invalid year or month provided.");
            }

            try
            {
                await _payrollService.ProcessPayrollAsync(year, month);
                return Ok(new { message = $"Successfully processed payroll for {month}/{year}." });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Log the exception ex
                return StatusCode(500, new { message = "An unexpected error occurred during payroll processing." });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetPayrollHistory()
        {
            try
            {
                var history = await _payrollService.GetPayrollHistoryAsync();
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An internal error occurred while fetching payroll history.");
            }
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetPayrollDashboard([FromQuery] int year, [FromQuery] int month)
        {
            if (year < 2000 || month < 1 || month > 12)
            {
                return BadRequest("Invalid year or month provided.");
            }

            try
            {
                var dashboardData = await _payrollService.GetPayrollDashboardAsync(year, month);
                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An internal error occurred while fetching dashboard data.");
            }
        }

        [HttpGet("history/{runId}/download-register")]
        public async Task<IActionResult> DownloadPayrollRegister(int runId)
        {
            var fileBytes = await _payrollService.GeneratePayrollRegisterExcelAsync(runId);

            if (fileBytes == null || fileBytes.Length == 0)
            {
                return NotFound("Could not find the specified payroll run or it contains no data.");
            }

            var runInfo = await _context.Tb_PayrollRuns.FindAsync(runId);
            var fileName = $"Payroll_Register_{new DateTime(runInfo.Year, runInfo.Month, 1):MMM_yyyy}.xlsx";

            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        [HttpGet("reports/attendance-exceptions")]
        public async Task<IActionResult> GetAttendanceExceptions([FromQuery] int year, [FromQuery] int month)
        {
            if (year == 0 || month == 0)
            {
                return BadRequest("Year and month are required.");
            }
            var exceptions = await _payrollService.GetAttendanceExceptionsAsync(year, month);
            return Ok(exceptions);
        }

        [HttpGet("reports/pending-leaves")]
        public async Task<IActionResult> GetPendingLeaveRequests([FromQuery] int year, [FromQuery] int month)
        {
            if (year == 0 || month == 0)
            {
                return BadRequest("Year and month are required.");
            }
            var pendingLeaves = await _payrollService.GetPendingLeaveRequestsAsync(year, month);
            return Ok(pendingLeaves);
        }

        [HttpGet("review-salary-structures")]
        public async Task<IActionResult> GetSalaryStructuresForReview()
        {
            try
            {
                var salaryStructures = await _payrollService.GetSalaryStructuresForReviewAsync();
                return Ok(salaryStructures);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while fetching salary structures for review.");
            }
        }

        [HttpGet("salary-record/{id}")]
        public async Task<IActionResult> GetMonthlySalaryRecord(int id)
        {
            var recordDto = await _payrollService.GetMonthlySalaryRecordByIdAsync(id);

            if (recordDto == null)
            {
                return NotFound($"Salary record with ID {id} not found.");
            }

            return Ok(recordDto);
        }

        
        [HttpPut("salary-record/{id}")]
        public async Task<IActionResult> UpdateMonthlySalaryRecord(int id, [FromBody] UpdateMonthlySalaryRecordDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var success = await _payrollService.UpdateMonthlySalaryRecordAsync(id, updateDto);

            if (!success)
            {
                // This could be due to the record not being found or a database error during the transaction.
                return NotFound($"Failed to update salary record with ID {id}. It may not exist or an error occurred.");
            }

            return NoContent(); // Standard successful response for a PUT request
        }

        [HttpGet("run/{payrollRunId}/salary-records")]
        public async Task<IActionResult> GetSalaryRecordsForRun(int payrollRunId)
        {
            var records = await _payrollService.GetSalaryRecordsForRunAsync(payrollRunId);
            return Ok(records);
        }

        [HttpGet("salary-record/{recordId}/edit")] // GET /api/payroll/salary-record/123/edit
      
        public async Task<IActionResult> GetSalaryRecordForEdit(int recordId)
        {
            try
            {
                var recordDto = await _payrollService.GetSalaryRecordForEditAsync(recordId);

                if (recordDto == null)
                {
                    // If the service returns null, it means the record was not found.
                    return NotFound($"Salary record with ID {recordId} not found.");
                }

                // If the record is found, return 200 OK with the DTO as the JSON payload.
                return Ok(recordDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An internal server error occurred. Please try again later.");
            }
        }
    }
}
