using PayrollManagementAPI.DTO.Advance;
using CompanyPlatform.Core.Models;

namespace PayrollManagementAPI.Services.Advance
{
    public interface IAdvanceService
    {
        Task<AdvanceViewDto> CreateAdvanceAsync(AdvanceCreateDto dto);
        Task<AdvanceViewDto> GetAdvanceByIdAsync(int advanceId);
        Task<IEnumerable<AdvanceViewDto>> GetAllAdvancesAsync();
        Task<IEnumerable<AdvanceViewDto>> GetAdvancesByEmployeeAsync(int employeeId);
        Task<AdvanceViewDto> UpdateAdvanceStatusAsync(int advanceId, AdvanceUpdateStatusDto dto);
        Task<bool> DeleteAdvanceAsync(int advanceId);
        Task<AdvanceRepayment> AddRepaymentAsync(int advanceId, AdvanceRepaymentCreateDto dto);
        Task<AdvanceHistoryDto> GetAdvanceHistoryAsync(int advanceId);
    }
}
