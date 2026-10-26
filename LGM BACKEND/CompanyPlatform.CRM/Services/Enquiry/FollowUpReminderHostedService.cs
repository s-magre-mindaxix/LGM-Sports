using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Enquiry
{
    public class FollowUpReminderHostedService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public FollowUpReminderHostedService(
            IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();

                var service =
                    scope.ServiceProvider
                         .GetRequiredService<IFollowUpReminderService>();

                await service.SendUpcomingFollowupRemindersAsync();

                await Task.Delay(
                    TimeSpan.FromHours(4),
                    stoppingToken);
            }
        }
    }
}
