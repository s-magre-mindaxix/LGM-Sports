using CompanyPlatform.Core.Services.Notification;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.Services.Notification;
using System.Security.Claims;

namespace PayrollManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var employeeIdStr = User.FindFirstValue("EmployeeId");
            if (!int.TryParse(employeeIdStr, out var employeeId))
            {
                return Unauthorized();
            }

            var notifications = await _notificationService.GetNotificationsForUserAsync(employeeId);
            return Ok(notifications);
        }

        [HttpPut("mark-all-as-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var employeeIdStr = User.FindFirstValue("EmployeeId");
            if (!int.TryParse(employeeIdStr, out var employeeId))
            {
                return Unauthorized();
            }

            await _notificationService.MarkAllAsReadAsync(employeeId);
            return NoContent();
        }

        [HttpPut("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            var employeeIdStr = User.FindFirstValue("EmployeeId");
            if (!int.TryParse(employeeIdStr, out var employeeId))
            {
                return Unauthorized();
            }

            var result = await _notificationService.MarkAsReadAsync(notificationId, employeeId);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpGet("unread-count/{employeeId}")]
        public async Task<IActionResult> GetUnreadCount(int employeeId)
        {
            var count = await _notificationService
                .GetUnreadCountAsync(employeeId);

            return Ok(count);
        }
    }
}
