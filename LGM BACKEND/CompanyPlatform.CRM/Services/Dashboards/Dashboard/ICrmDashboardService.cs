using CompanyPlatform.CRM.DTO.Dashboard;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Dashboards.Dashboard
{
    public interface ICrmDashboardService
    {
        Task<CrmDashboardStatsDto> GetDashboardStatsAsync();
    }
}
