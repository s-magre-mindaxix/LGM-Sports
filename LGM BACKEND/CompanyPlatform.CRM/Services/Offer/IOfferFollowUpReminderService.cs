using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Offer
{
    public interface IOfferFollowUpReminderService
    {
        Task SendUpcomingFollowupRemindersAsync();
    }
}
