using Microsoft.AspNetCore.SignalR;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Hubs;
using CompanyPlatform.Core.Services.Notification;

namespace CompanyPlatform.Core.Services.Notification
{
    public interface INotificationHelper
    {
        Task SendManagerNotificationAsync(int employeeId, string actionMessage);

        Task SendNotificationToEmployeeAsync(int employeeId, string message);
    }

    public class NotificationHelper : INotificationHelper
    {
        private readonly ApplicationDBContext _context;
        private readonly INotificationService _notificationService;
        private readonly IUserConnectionService _userConnectionService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationHelper(
            ApplicationDBContext context,
            INotificationService notificationService,
            IUserConnectionService userConnectionService,
            IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _notificationService = notificationService;
            _userConnectionService = userConnectionService;
            _hubContext = hubContext;
        }

        public async Task SendManagerNotificationAsync(int employeeId, string actionMessage)
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null || !employee.ReportingTo.HasValue)
            {
                return;
            }

            var managerId = employee.ReportingTo.Value;
            var message = $"'{employee.FirstName} {employee.LastName}' has updated their {actionMessage}.";

            await _notificationService.CreateNotificationAsync(managerId, message);

            var managerConnectionId = _userConnectionService.GetUserConnection(managerId);
            if (!string.IsNullOrEmpty(managerConnectionId))
            {
                await _hubContext.Clients.Client(managerConnectionId).SendAsync("ReceiveNotification", message);
            }
        }

        public async Task SendNotificationToEmployeeAsync(int employeeId, string message)
        {
            // 1. Save notification to the database for persistence
            await _notificationService.CreateNotificationAsync(employeeId, message);

            // 2. Get the SignalR connection ID for the employee
            var connectionId = _userConnectionService.GetUserConnection(employeeId);

            // 3. If the employee is currently connected, push a real-time notification
            if (!string.IsNullOrEmpty(connectionId))
            {
                await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveNotification", message);
            }
        }
    }
}
