using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PayrollManagementAPI.DTO.LoanApplication;
using PayrollManagementAPI.Services.Loan;
using PayrollManagementAPI.Services.LoanApplication;
using System.Threading.Tasks;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/loan")]
    [ApiController]
    [Authorize]
    public class LoanApplicationController : ControllerBase
    {
        private readonly ILoanApplicationService _loanService;
        private readonly ILogger<LoanApplicationController> _logger;

        public LoanApplicationController(ILoanApplicationService loanService, ILogger<LoanApplicationController> logger)
        {
            _loanService = loanService;
            _logger = logger;
        }

        [HttpPost("apply")]
        public async Task<IActionResult> ApplyForLoan([FromBody] LoanApplicationCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _loanService.CreateLoanApplicationAsync(dto);
            return Ok(result);
        }

        [HttpGet("history/{employeeId}")]
        public async Task<IActionResult> GetLoanHistory(int employeeId)
        {
            var history = await _loanService.GetLoanHistoryByEmployeeIdAsync(employeeId);
            return Ok(history);
        }

        [HttpGet("approvals/{managerId}")]
        [Authorize(Roles = "Manager,Admin,HR")]
        public async Task<IActionResult> GetPendingApprovals(int managerId)
        {
            var approvals = await _loanService.GetPendingLoanApprovalsAsync(managerId);
            return Ok(approvals);
        }

        [HttpPut("update-status/{loanApplicationId}")]
        [Authorize(Roles = "Manager,Admin,HR")]
        public async Task<IActionResult> UpdateLoanStatus(int loanApplicationId, [FromBody] LoanStatusUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _loanService.UpdateLoanStatusAsync(loanApplicationId, dto);
            if (!result) return NotFound(new { message = "Loan application not found." });
            return Ok(new { message = "Status updated successfully." });
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var dashboard = await _loanService.GetDashboardAsync(null);
            return Ok(dashboard);
        }

        [HttpGet("dashboard/manager/{managerId}")]
        [Authorize(Roles = "Manager,Admin,HR")]
        public async Task<IActionResult> GetDashboardForManager(int managerId)
        {
            var dashboard = await _loanService.GetDashboardAsync(managerId);
            return Ok(dashboard);
        }
        [HttpGet("dashboard/{userId}/{role}")]
        public async Task<IActionResult> GetDashboardStats(int userId, string role)
        {
            var data = await _loanService.GetDashboardStatsAsync(userId, role);
            return Ok(data);
        }

        [HttpGet("loan-types/{userId}/{role}")]
        public async Task<IActionResult> GetLoanTypeSummary(int userId, string role)
        {
            var data = await _loanService.GetLoanTypeSummaryAsync(userId, role);
            return Ok(data);
        }

        [HttpGet("reports/recovery")]
        [Authorize(Roles = "Manager,Admin,HR")]
        public async Task<IActionResult> GenerateRecoveryReport()
        {
            var report = await _loanService.GenerateRecoveryReportAsync();
            return Ok(report);
        }

        [HttpGet("overdue")]
        [Authorize(Roles = "Manager,Admin,HR")]
        public async Task<IActionResult> GetOverdueLoans()
        {
            var overdueLoans = await _loanService.GetOverdueLoansAsync();
            return Ok(overdueLoans);
        }
        [HttpGet("dashboard/employee/{employeeId}")]
        public async Task<IActionResult> GetDashboardForEmployee(int employeeId)
        {
          
            var dashboard = await _loanService.GetEmployeeDashboardAsync(employeeId);
            return Ok(dashboard);
        }
        [HttpGet("history/team/{managerId}")]
        [Authorize(Roles = "Manager,Admin,HR")]
        public async Task<IActionResult> GetTeamHistory(int managerId)
        {
            var history = await _loanService.GetTeamLoanHistoryAsync(managerId);
            return Ok(history);
        }

    }
}