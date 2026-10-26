
using CompanyPlatform.Core.Models;

namespace CompanyPlatform.Core.Services.Notification
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(int employeeId, string message);
        Task<List<Notifications>> GetNotificationsForUserAsync(int employeeId);
        Task MarkAllAsReadAsync(int employeeId);
        Task<bool> MarkAsReadAsync(int notificationId, int employeeId);

        Task<int> GetUnreadCountAsync(int employeeId);
    }
}
