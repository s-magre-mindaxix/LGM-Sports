using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace PayrollManagementAPI.Services.Notification
{
    public class NotificationCleanupService : BackgroundService
    {
        private readonly ILogger<NotificationCleanupService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public NotificationCleanupService(ILogger<NotificationCleanupService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Notification Cleanup Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Notification Cleanup Service is running at: {time}", DateTimeOffset.Now);

                await CleanupNotifications();

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        private async Task CleanupNotifications()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDBContext>();
                try
                {
                    var cutoffTime = DateTime.UtcNow.AddMinutes(-10);

                    var rowsDeleted = await dbContext.Tbl_Notifications
                        .Where(n => n.IsRead && n.ReadAt.HasValue && n.ReadAt.Value < cutoffTime)
                        .ExecuteDeleteAsync();

                    if (rowsDeleted > 0)
                    {
                        _logger.LogInformation("Deleted {Count} old, read notifications.", rowsDeleted);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while cleaning up notifications.");
                }
            }
        }
    }
}
