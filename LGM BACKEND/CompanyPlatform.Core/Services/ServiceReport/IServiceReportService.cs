using CompanyPlatform.Core.DTO.ServiceReport;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.ServiceReport
{
    public interface IServiceReportService
    {
        Task<IEnumerable<ServiceReportDto>> GetAllServiceReportsAsync();
        Task<ServiceReportDto> GetServiceReportByIdAsync(int id);
        Task<ServiceReportDto> CreateServiceReportAsync(ServiceReportDto serviceReportDto);
        Task<bool> UpdateServiceReportAsync(int id, ServiceReportDto serviceReportDto);
        Task<bool> DeleteServiceReportAsync(int id);
    }
}
