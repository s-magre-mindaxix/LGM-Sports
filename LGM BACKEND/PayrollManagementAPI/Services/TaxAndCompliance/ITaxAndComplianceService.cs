using PayrollManagementAPI.DTO.TaxAndCompliance;

namespace PayrollManagementAPI.Services.TaxAndCompliance
{
    public interface ITaxAndComplianceService
    {
        Task<ComplianceDashboardStatsDto> GetDashboardStatsAsync(int year, int month);
        Task<IEnumerable<StatutoryRecordDto>> GetStatutoryRecordsAsync(int year, int month);
        Task<IEnumerable<ComplianceStatusDto>> GetComplianceStatusAsync(int year, int month);

        Task<bool> UpdateComplianceItemAsync(UpdateComplianceStatusDto dto);

        Task<ComplianceItemDetailsDto> GetComplianceItemDetailsAsync(int id);
    }
}
