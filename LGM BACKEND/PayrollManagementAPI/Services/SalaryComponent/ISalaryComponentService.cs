using PayrollManagementAPI.DTO;
using PayrollManagementAPI.DTO.ExpenseType;
using PayrollManagementAPI.DTO.SalaryComponent;

namespace PayrollManagementAPI.Services.SalaryComponent
{
    public interface ISalaryComponentService
    {
        Task<IEnumerable<SalaryComponentDto>> GetAllAsync();
        Task<SalaryComponentDto> GetByIdAsync(int id);
        Task<SalaryComponentDto> CreateAsync(SalaryComponentCreateDto dto);
        Task<bool> UpdateAsync(int id, SalaryComponentCreateDto dto); // Can reuse Create DTO for update
        Task<bool> DeleteAsync(int id);

        Task<IEnumerable<SalaryComponentDto>> GetComponent();
    }
}
