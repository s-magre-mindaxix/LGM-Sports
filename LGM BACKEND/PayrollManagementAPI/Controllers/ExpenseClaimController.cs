using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO.ExpenseClaim;
using PayrollManagementAPI.Services.ExpenseClaim;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ExpenseClaimController : ControllerBase
    {
        private readonly IExpenseClaimService _expenseClaimService;
        private readonly ILogger<ExpenseClaimController> _logger;

        public ExpenseClaimController(IExpenseClaimService expenseClaimService, ILogger<ExpenseClaimController> logger)
        {
            _expenseClaimService = expenseClaimService;
            _logger = logger;
        }

        private int GetCurrentEmployeeId()
        {
            var employeeIdClaim = User.Claims.FirstOrDefault(c => c.Type == "EmployeeId");
            if (employeeIdClaim == null || !int.TryParse(employeeIdClaim.Value, out var employeeId))
            {
                throw new InvalidOperationException("Employee ID not found in token.");
            }
            return employeeId;
        }

        [HttpPost]
        public async Task<IActionResult> CreateClaim([FromForm] CreateExpenseClaimDto claimDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var employeeId = GetCurrentEmployeeId();
                var createdClaim = await _expenseClaimService.CreateClaimAsync(claimDto, employeeId);
                return CreatedAtAction(nameof(CreateClaim), new { id = createdClaim.Id }, createdClaim);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating expense claim.");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("my-claims")]
        [Authorize]
        public async Task<IActionResult> GetMyClaims()
        {
            try
            {
                var employeeId = GetCurrentEmployeeId();
                var claims = await _expenseClaimService.GetClaimsByEmployeeIdAsync(employeeId);
                return Ok(claims);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user's expense claims.");
                return StatusCode(500, new { message = "An error occurred while fetching your claims." });
            }
        }

        [HttpGet("pending-approvals")]
        [Authorize]
        public async Task<IActionResult> GetPendingApprovals()
        {
            try
            {
                var managerId = GetCurrentEmployeeId();
                var claims = await _expenseClaimService.GetPendingClaimsForManagerAsync(managerId);
                return Ok(claims);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching pending approvals.");
                return StatusCode(500, new { message = "An error occurred while fetching pending approvals." });
            }
        }

        [HttpPut("{claimId}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateClaimStatus(int claimId, [FromBody] UpdateExpenseStatusDto statusDto)
        {
            if (!ModelState.IsValid || (statusDto.Status != "Approved" && statusDto.Status != "Rejected"))
            {
                return BadRequest("Invalid status provided.");
            }

            try
            {
                var managerId = GetCurrentEmployeeId();
                var updatedClaim = await _expenseClaimService.UpdateClaimStatusAsync(claimId, statusDto, managerId);
                return Ok(updatedClaim);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating claim status for claim ID {ClaimId}", claimId);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("dashboard-stats")]
        [Authorize]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var employeeId = GetCurrentEmployeeId();
                bool isAdminOrHr = User.IsInRole("Admin") || User.IsInRole("HR") || User.IsInRole("Sales") || User.IsInRole("Account");

                var stats = await _expenseClaimService.GetDashboardStatsAsync(employeeId, isAdminOrHr);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching dashboard stats.");
                return StatusCode(500, new { message = "An error occurred while fetching dashboard statistics." });
            }
        }

        [HttpGet("claim-history")]
        [Authorize] 
        public async Task<IActionResult> GetClaimHistory()
        {
            try
            {
                var claims = await _expenseClaimService.GetAllProcessedClaimsAsync();
                return Ok(claims);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching claim history.");
                return StatusCode(500, new { message = "An error occurred while fetching claim history." });
            }
        }

        [HttpPost("generate-report")]
        [Authorize]
        public async Task<IActionResult> GenerateReport([FromBody] GenerateReportDto reportDto)
        {
            var fileBytes = await _expenseClaimService.GenerateExpenseReportAsync(reportDto.StartDate, reportDto.EndDate);
            var fileName = $"ExpenseReport_{DateTime.UtcNow:yyyyMMdd}.csv";
            return File(fileBytes, "text/csv", fileName);
        }

        [HttpPut("bulk-approve")]
        [Authorize]
        public async Task<IActionResult> BulkApprove([FromBody] BulkActionDto bulkActionDto)
        {
            var managerId = GetCurrentEmployeeId();
            var approvedCount = await _expenseClaimService.BulkApproveClaimsAsync(bulkActionDto.ClaimIds, managerId);

            if (approvedCount == 0)
            {
                return BadRequest(new { message = "No valid claims were found to approve." });
            }

            return Ok(new { message = $"{approvedCount} claims have been successfully approved." });
        }
    }
}
