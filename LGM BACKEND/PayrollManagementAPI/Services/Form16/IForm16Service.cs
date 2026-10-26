using Microsoft.AspNetCore.Mvc;
using PayrollManagementAPI.DTO.Form16;

namespace PayrollManagementAPI.Services.Form16
{
    public interface IForm16Service
    {
        Task<Form16DashboardDto> GetForm16DashboardAsync(string financialYear);
        Task<EmployeeForm16ViewDto> GetEmployeeForm16StatusAsync(int employeeId, string financialYear);
        Task<IActionResult> GeneratePartBAsync(int employeeId, string financialYear);
        Task<IActionResult> PublishFormAsync(int form16StatusId);

        Task<UploadResultDto> ProcessPartAUploadAsync(Stream fileStream, string financialYear);

        Task<Form16PartBDto?> GetForm16DataAsync(int form16StatusId);
    }
}
