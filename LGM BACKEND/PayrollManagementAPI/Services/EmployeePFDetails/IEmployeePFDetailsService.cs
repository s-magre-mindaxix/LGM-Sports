using CompanyPlatform.Core.DTO.EmployeePFDetails;

namespace CompanyPlatform.Core.Services.EmployeePFDetails
{
    public interface IEmployeePFDetailsService
    {
        Task<ViewPFDetailsDto> GetByEmployeeIdAsync(int employeeId);
        Task<ViewPFDetailsDto> UpsertAsync(UpsertPFDetailsDto dto);
    }
}
