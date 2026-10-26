using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Hubs;
using CompanyPlatform.Core.Services.Notification;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.ShipmentUnderTransit
{
    public class ShipmentEtaNotificationService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public ShipmentEtaNotificationService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("Shipment ETA Notification Service Started");

            while (!stoppingToken.IsCancellationRequested)
            {
                Console.WriteLine($"Checking ETA Notification : {DateTime.Now}");

                using var scope = _scopeFactory.CreateScope();

                var context = scope.ServiceProvider.GetRequiredService<ApplicationDBContext>();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                var userConnectionService = scope.ServiceProvider.GetRequiredService<IUserConnectionService>();
                var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<NotificationHub>>();

                var notifyDate = DateTime.Today.AddDays(2);

                var shipments = await context.Tbl_ShipmentUnderTransits
                    .Include(x => x.ShipmentInitiate)
                    .Where(x =>
                        x.ETADate.HasValue &&
                        x.ETADate.Value.Date == notifyDate &&
                        !x.IsDeleted)
                    .ToListAsync();

                Console.WriteLine($"Notify Date : {notifyDate:dd-MM-yyyy}");
                Console.WriteLine($"Shipment Count : {shipments.Count}");

                foreach (var item in shipments)
                {
                    Console.WriteLine($"ShipmentId : {item.ShipmentInitiateId}");
                    Console.WriteLine($"ETA : {item.ETADate}");
                }

                if (shipments.Any())
                {
                    var admins = await context.Employees
                    .Where(x => (x.ID == 1 || x.ID == 4) && !x.IsDeleted && x.IsActive)
                    .ToListAsync();

                    foreach (var shipment in shipments)
                    {
                        var message =
                            $"Shipment '{shipment.ShipmentInitiate.ShipmentNo}' ETA is on {shipment.ETADate:dd-MM-yyyy}. Please take the necessary action.";

                        foreach (var admin in admins)
                        {
                            // Check whether this notification has already been created today
                            bool alreadySent = await context.Tbl_Notifications.AnyAsync(x =>
                                x.EmployeeId == admin.ID &&
                                x.Message == message &&
                                x.CreatedAt.Date == DateTime.Today);

                            if (alreadySent)
                                continue;

                            await notificationService.CreateNotificationAsync(admin.ID, message);

                            var connectionId = userConnectionService.GetUserConnection(admin.ID);

                            if (!string.IsNullOrEmpty(connectionId))
                            {
                                await hubContext.Clients.Client(connectionId)
                                    .SendAsync("ReceiveNotification", message);
                            }
                        }
                    }
                }

                // await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken); while testing

                await Task.Delay(TimeSpan.FromDays(1), stoppingToken);  //for production
            }
        }
    }
}
