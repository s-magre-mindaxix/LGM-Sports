using CompanyPlatform.Core.DTO.EmployeeStatutoryDetails;

namespace CompanyPlatform.Core.Services.EmployeeStatutoryDetails
{
    public interface IEmployeeStatutoryDetailsService
    {
        Task<StatutoryDetailsDto> GetByEmployeeIdAsync(int employeeId);
        Task<StatutoryDetailsDto> CreateAsync(CreateStatutoryDetailsDto dto);
        Task<StatutoryDetailsDto> UpdateByEmployeeIdAsync(int employeeId, UpdateStatutoryDetailsDto dto);
        Task<bool> DeleteByEmployeeIdAsync(int employeeId);
    }
}
