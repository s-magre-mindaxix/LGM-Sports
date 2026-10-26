using CompanyPlatform.Core.Data;
using CompanyPlatform.CRM.DTO.Dashboard;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Dashboards.Dashboard
{
    public class CrmDashboardService : ICrmDashboardService
    {
        private readonly ApplicationDBContext _context;

        public CrmDashboardService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<CrmDashboardStatsDto> GetDashboardStatsAsync()
        {
            var stats = new CrmDashboardStatsDto
            {
                Companies = await _context.Tbl_Companies
                .Where(x => !x.IsDeleted)
                .CountAsync(),

                Employees = await _context.Employees
                 .Where(x => !x.IsDeleted)
                 .CountAsync(),

                Vendors = await _context.Tbl_Vendors
                 .Where(x => !x.IsDeleted)
                 .CountAsync(),

                Customers = await _context.Tbl_Customers
                .Where(x => !x.IsDeleted)
                .CountAsync(),

                Products = await _context.Tbl_Products
                .Where(x => !x.IsDeleted)
                .CountAsync(),

                Accessories = await _context.Tbl_Accessories
                .Where(x => !x.IsDeleted)
                .CountAsync(),

                Enquiries = await _context.Tbl_Enquiries
                .Where(x => !x.IsDeleted)
                .CountAsync(),

                Offers = await _context.Tbl_Offers
                .Where(x => !x.IsDeleted)
                .CountAsync(),

                OrderAcceptances = await _context.Tbl_OrderAcceptances
                .Where(x => !x.IsDeleted)
                .CountAsync(),

                ProformaInvoices = await _context.Tbl_ProformaInvoices
                .Where(x => !x.IsDeleted)
                .CountAsync(),

                Invoices = await _context.Tbl_Invoices
                 .Where(x => !x.IsDeleted)
                 .CountAsync(),
            };

            return stats;
        }
    }
}
