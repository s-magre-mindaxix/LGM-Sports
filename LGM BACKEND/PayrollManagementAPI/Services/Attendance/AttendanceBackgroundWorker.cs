using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace PayrollManagementAPI.Services.Attendance
{
    public class AttendanceBackgroundWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AttendanceBackgroundWorker> _logger;
        private bool _hasRunToday = false;

        public AttendanceBackgroundWorker(IServiceProvider serviceProvider, ILogger<AttendanceBackgroundWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Attendance Background Worker Started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;
                // Set your trigger time here (e.g., 15:15 for 3:15 PM or 17:30 for 5:30 PM)
                var cutoffTime = new TimeSpan(13, 01, 0);

                // If current time is past cutoff and we haven't run today
                if (now.TimeOfDay >= cutoffTime && !_hasRunToday)
                {
                    _logger.LogInformation("Cutoff time reached ({Time}). Processing absentees...", now);

                    try
                    {
                        using (var scope = _serviceProvider.CreateScope())
                        {
                            var attendanceService = scope.ServiceProvider.GetRequiredService<IAttendanceService>();
                            await attendanceService.MarkAbsenteesAsync();
                        }
                        _hasRunToday = true;
                        _logger.LogInformation("Absentees processed successfully.");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error occurred in AttendanceBackgroundWorker.");
                    }
                }

                // Reset the flag at the start of a new day (Midnight)
                if (now.Hour == 0 && _hasRunToday)
                {
                    _hasRunToday = false;
                    _logger.LogInformation("Worker flag reset for the new day.");
                }

                // Wait 5 minutes before checking the clock again
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}