using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.DTO.Employee;
using CompanyPlatform.Core.Models;
using System.Security.Claims;

namespace CompanyPlatform.Core.Services.Employee
{
    public interface IEmployeeService
    {
        Task<EmployeeDetailDto> GetEmployeeByIdAsync(int id);
        Task<IEnumerable<EmployeeDetailDto>> GetAllEmployeesAsync(ClaimsPrincipal user);
        Task<EmployeeFullDetailDto> GetEmployeeFullDetailsByIdAsync(int id);
        Task<EmployeeDetailDto> UpdateEmployeeAsync(int id, UpdateEmployeeDto updateDto);
        Task<bool> DeleteEmployeeAsync(int id);
        Task<EmployeeDetailDto> GetEmployeeByCodeAsync(string employeeCode);
        Task<IEnumerable<EmployeeSelectionDto>> GetEmployeeSelectionListAsync();
        Task<IEnumerable<EmployeeSelectionDto>> GetEmployeesByRoleAsync(string role);
        Task<IEnumerable<EmployeeSelectionDto>> GetEmployeesByRoleAndDepartmentAsync(string role, int departmentId);
        Task<bool> UpdateEmployeeStatusAsync(int id, bool isActive);

        Task<bool> SetEmployeeReportingAsync(SetReportingDto dto);
    }
}
