using CompanyPlatform.Core.DTO.FaultReport;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Services.FaultReport
{
    public interface IFaultReportService
    {
        Task<IEnumerable<FaultReportDto>> GetAllAsync();
        Task<FaultReportDto> GetByIdAsync(int id);
        Task<FaultReportDto> CreateAsync(FaultReportDto faultReportDto);
        Task<bool> UpdateAsync(int id, FaultReportDto faultReportDto);
        Task<bool> DeleteAsync(int id);
    }
}
