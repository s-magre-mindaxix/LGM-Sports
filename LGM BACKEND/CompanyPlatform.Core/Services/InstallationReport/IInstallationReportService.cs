using CompanyPlatform.Core.DTO.Installation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.InstallationReport
{
    public interface IInstallationReportService
    {
        Task<IEnumerable<InstallationReportDto>> GetAllInstallationReportsAsync();
        Task<InstallationReportDto> GetInstallationReportByIdAsync(int id);
        Task<InstallationReportDto> CreateInstallationReportAsync(CreateInstallationReportDto createDto);
        Task<bool> UpdateInstallationReportAsync(int id, CreateInstallationReportDto updateDto);
        Task<bool> DeleteInstallationReportAsync(int id);
    }
}
