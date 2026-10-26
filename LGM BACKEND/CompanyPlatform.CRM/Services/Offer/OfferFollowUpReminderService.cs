using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Services.Notification;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Offer
{
    public class OfferFollowUpReminderService : IOfferFollowUpReminderService
    {
        private readonly ApplicationDBContext _context;
        private readonly INotificationHelper _notificationHelper;

        public OfferFollowUpReminderService(
            ApplicationDBContext context,
            INotificationHelper notificationHelper)
        {
            _context = context;
            _notificationHelper = notificationHelper;
        }

        public async Task SendUpcomingFollowupRemindersAsync()
        {
            var tomorrow = DateTime.Today.AddDays(1);

            var startDate = tomorrow.Date;
            var endDate = startDate.AddDays(1);

            var offers = await _context.Tbl_Offers
                .Where(x =>
                    !x.IsDeleted &&
                    x.Status == "DRAFT" &&
                    x.AssignedToEmployeeId > 0 &&
                    x.NextFollowUpDate.HasValue &&
                    x.NextFollowUpDate >= startDate &&
                    x.NextFollowUpDate < endDate &&
                    x.FollowUpReminderSent != true)
                .ToListAsync();

            foreach (var offer in offers)
            {
                var message =
                    $"Follow-up reminder for Offer '{offer.OfferNo}' is scheduled tomorrow ({offer.NextFollowUpDate:dd-MMM-yyyy}).";

                await _notificationHelper.SendNotificationToEmployeeAsync(
                    offer.AssignedToEmployeeId,
                    message);

                offer.FollowUpReminderSent = true;
            }

            await _context.SaveChangesAsync();
        }
    }
}
