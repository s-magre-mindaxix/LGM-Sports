using CompanyPlatform.Core.DTO.Department;
using PayrollManagementAPI.DTO.ExpenseType;

namespace PayrollManagementAPI.Services.ExpenseType
{
    public interface IExpenseTypeService
    {
        Task<IEnumerable<ExpenseTypeDto>> GetAllExpenseTypesAsync();
        Task<ExpenseTypeDto> GetExpenseTypeByIdAsync(int id);
        Task<ExpenseTypeDto> CreateExpenseTypeAsync(ExpenseTypeDto expenseTypeDto);
        Task<bool> UpdateExpenseTypeAsync(int id, ExpenseTypeDto expenseTypeDto);
        Task DeleteExpenseTypeAsync(int id);
    }
}
