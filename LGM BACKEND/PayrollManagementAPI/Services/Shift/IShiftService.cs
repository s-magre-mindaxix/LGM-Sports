using PayrollManagementAPI.DTO;
using PayrollManagementAPI.DTO.ExpenseType;

namespace PayrollManagementAPI.Services.Shift
{
    public interface IShiftService
    {
        Task<IEnumerable<ShiftDto>> GetAllShiftsAsync();
        Task<ShiftDto> GetShiftByIdAsync(int id);
        Task<ShiftDto> CreateShiftAsync(ShiftDto dto);
        Task<bool> UpdateShiftAsync(int id, ShiftDto dto);
        Task DeleteShiftAsync(int id);
    }
}
