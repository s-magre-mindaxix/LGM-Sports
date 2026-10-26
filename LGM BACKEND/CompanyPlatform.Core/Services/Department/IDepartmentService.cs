using CompanyPlatform.Core.DTO.Department;

namespace CompanyPlatform.Core.Services.Department
{
    public interface IDepartmentService
    {
        Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync();
        Task<DepartmentDto> GetDepartmentByIdAsync(int id);
        Task<DepartmentDto> CreateDepartmentAsync(DepartmentDto departmentDto);
        Task<bool> UpdateDepartmentAsync(int id, DepartmentDto departmentDto);
        Task<bool> DeleteDepartmentAsync(int id);
    }
}
