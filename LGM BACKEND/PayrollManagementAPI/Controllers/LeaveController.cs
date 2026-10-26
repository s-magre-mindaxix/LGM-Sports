using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PayrollManagementAPI.DTO.LeaveDetails;
using PayrollManagementAPI.Services.Leave;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AnonymityAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LeaveController : ControllerBase
    {
        private readonly ILeaveService _leaveService;
        private readonly ILogger<LeaveController> _logger;

        public LeaveController(ILeaveService leaveService, ILogger<LeaveController> logger)
        {
            _leaveService = leaveService;
            _logger = logger;
        }

        [HttpGet("balance/{employeeId}")]
        public async Task<IActionResult> GetLeaveBalance(int employeeId, [FromQuery] int year)
        {
            _logger.LogInformation("GET: api/Leave/balance/{EmployeeId} for year {Year} invoked.", employeeId, year);
            var balance = await _leaveService.GetLeaveBalanceAsync(employeeId, year);
            return Ok(balance);
        }

        [HttpGet("history/{employeeId}")]
        public async Task<IActionResult> GetLeaveHistory(int employeeId)
        {
            _logger.LogInformation("GET: api/Leave/history/{EmployeeId} invoked.", employeeId);
            var history = await _leaveService.GetLeaveHistoryAsync(employeeId);
            return Ok(history);
        }

        [HttpPost("apply")]
        public async Task<IActionResult> ApplyForLeave([FromBody] LeaveRequestCreateDto leaveDto)
        {
            _logger.LogInformation("POST: api/Leave/apply invoked for EmployeeID: {EmployeeId}", leaveDto.EmployeeID);
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _leaveService.ApplyForLeaveAsync(leaveDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying for leave for EmployeeID: {EmployeeId}", leaveDto.EmployeeID);
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("approvals/{managerId}")]
        public async Task<IActionResult> GetPendingApprovals(int managerId)
        {
            _logger.LogInformation("GET: api/Leave/approvals/{ManagerId} invoked.", managerId);
            var requests = await _leaveService.GetPendingApprovalsAsync(managerId);
            return Ok(requests);
        }

        [HttpGet("leavehistory/{requesterId}")]
        public async Task<IActionResult> GetLeaveHistorys(int requesterId)
        {
            _logger.LogInformation("GET: api/Leave/leavehistory/{RequesterId} invoked.", requesterId);

            bool isAdmin = User.IsInRole("Admin");
            //string role = User.IsInRole("HR") ? "HR" : (isAdmin ? "Admin" : "Manager");
            //string role = User.IsInRole("HR")
            //                           ? "HR"
            //                           : isAdmin
            //                               ? "Admin"
            //                               : User.IsInRole("Employee")
            //                                   ? "Employee"
            //                                   : "Manager";
            string role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "Employee";

            var history = await _leaveService.GetFilteredTeamLeaveHistoryAsync(requesterId, isAdmin, role);
            return Ok(history);
        }

        [HttpPut("update-status/{leaveRequestId}")]
        public async Task<IActionResult> UpdateLeaveStatus(int leaveRequestId, [FromBody] UpdateStatusDto dto)
        {
            _logger.LogInformation("PUT: api/Leave/update-status/{LeaveRequestId} invoked.", leaveRequestId);
            var result = await _leaveService.UpdateLeaveStatusAsync(leaveRequestId, dto.Status, dto.ApprovedByEmployeeId);
            if (result == null)
            {
                return NotFound("Leave request not found.");
            }
            return Ok(result);
        }

        [HttpGet("all-balances")]
        [Authorize]
        public async Task<IActionResult> GetAllBalances([FromQuery] int year)
        {
            var userIdClaim = User.FindFirst("EmployeeId")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized("User ID claim not found.");

            int requesterEmployeeId = int.Parse(userIdClaim);
            var currentYear = year == 0 ? DateTime.Now.Year : year;

            bool isAdmin = User.IsInRole("Admin");

            var result = await _leaveService.GetAllEmployeesLeaveBalancesAsync(currentYear, requesterEmployeeId, isAdmin);

            return Ok(result);
        }

    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } 
        public int ApprovedByEmployeeId { get; set; }
    }
}