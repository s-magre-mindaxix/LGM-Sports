using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Services.Notification;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Enquiry
{
    public class FollowUpReminderService : IFollowUpReminderService
    {
        private readonly ApplicationDBContext _context;
        private readonly INotificationHelper _notificationHelper;

        public FollowUpReminderService(
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

            var enquiries = await _context.Tbl_Enquiries
                .Where(x =>
                    !x.IsDeleted &&
                    x.Status == "DRAFT" &&
                    x.AssignedToEmployeeId.HasValue &&
                    x.NextFollowUpDate.HasValue &&
                    x.NextFollowUpDate >= startDate &&
                    x.NextFollowUpDate < endDate &&
                    x.FollowUpReminderSent != true)
                .ToListAsync();

            foreach (var enquiry in enquiries)
            {
                string message =
                    $"Follow-up reminder for Enquiry '{enquiry.EnquiryNo}' is scheduled tomorrow ({enquiry.NextFollowUpDate:dd-MMM-yyyy}).";

                await _notificationHelper.SendNotificationToEmployeeAsync(
                    enquiry.AssignedToEmployeeId!.Value,
                    message);

                enquiry.FollowUpReminderSent = true;
            }

            await _context.SaveChangesAsync();
        }
    }
}
