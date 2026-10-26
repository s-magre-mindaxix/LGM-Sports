using PayrollManagementAPI.DTO.LoanMaster;

namespace PayrollManagementAPI.Services.LoanMaster
{
    public interface ILoanMasterService
    {
        Task<List<LoanMasterViewDto>> GetAllAsync();
        Task<LoanMasterViewDto> GetByIdAsync(int id);
        Task<LoanMasterViewDto> CreateAsync(LoanMasterCreateDto dto);
        Task<bool> UpdateAsync(int id, LoanMasterUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
