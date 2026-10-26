using PayrollManagementAPI.DTO;
using CompanyPlatform.Core.DTO.Employee;
using PayrollManagementAPI.DTO.SalaryStructure;
using System.Security.Claims;

namespace PayrollManagementAPI.Services.SalaryStructure
{
    public interface ISalaryStructureService
    {
        Task<IEnumerable<SalaryStructureViewDto>> GetSalaryStructureViewAsync(ClaimsPrincipal user);
        Task<SalaryStructureDetailDto> GetSalaryStructureByEmployeeIdAsync(int employeeId);
        Task<SalaryStructureDetailDto> CreateSalaryStructureAsync(SalaryStructureCreateDto dto);
        Task<bool> UpdateSalaryStructureAsync(int employeeId, SalaryStructureUpdateDto dto);
        Task<bool> DeleteSalaryStructureAsync(int employeeId);
        Task<SalaryDashboardStatsDto> GetDashboardStatsAsync(ClaimsPrincipal user);
        Task<SalaryStructureViewDtos> GetSalaryStructureViewByIdAsync(int employeeId);

        Task<SalaryStructureDetailDto> ReviseSalaryStructureAsync(int employeeId, SalaryStructureReviseDto dto);

        Task<IEnumerable<SalaryStructureHistoryItemDto>> GetSalaryStructureHistoryAsync(int employeeId);
    }
}
