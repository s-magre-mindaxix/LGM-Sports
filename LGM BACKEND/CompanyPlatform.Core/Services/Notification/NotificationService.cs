using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Services.Notification;

namespace PayrollManagementAPI.Services.Notification
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDBContext _context;

        public NotificationService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task CreateNotificationAsync(int employeeId, string message)
        {
            var notification = new Notifications
            {
                EmployeeId = employeeId,
                Message = message,
            };
            await _context.Tbl_Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Notifications>> GetNotificationsForUserAsync(int employeeId)
        {
            var notifications = await _context.Tbl_Notifications
                .Where(n => n.EmployeeId == employeeId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(20) 
                .ToListAsync();
            return notifications;
        }

        public async Task MarkAllAsReadAsync(int employeeId)
        {
            await _context.Tbl_Notifications
                .Where(n => n.EmployeeId == employeeId && !n.IsRead)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(n => n.IsRead, true)
                    .SetProperty(n => n.ReadAt, DateTime.UtcNow));
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, int employeeId)
        {
            var notification = await _context.Tbl_Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.EmployeeId == employeeId);

            if (notification == null || notification.IsRead)
            {
                return false;
            }

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetUnreadCountAsync(int employeeId)
        {
            return await _context.Tbl_Notifications
                .CountAsync(x => x.EmployeeId == employeeId && !x.IsRead);
        }
    }

    public class NotificationDto
    {
        public int Id { get; set; }

        public string Message { get; set; }

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
