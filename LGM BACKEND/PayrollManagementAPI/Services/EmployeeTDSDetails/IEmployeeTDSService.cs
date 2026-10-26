using CompanyPlatform.Core.DTO.EmployeeTDSDetails;

namespace CompanyPlatform.Core.Services.EmployeeTDSDetails
{
    public interface IEmployeeTDSService
    {
        Task<ViewTDSDetailsDto> GetByEmployeeIdAsync(int employeeId);
        Task<ViewTDSDetailsDto> UpsertAsync(UpsertTDSDetailsDto dto);
    }
}
