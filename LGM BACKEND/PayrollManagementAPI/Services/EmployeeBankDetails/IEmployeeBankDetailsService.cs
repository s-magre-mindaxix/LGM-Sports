using CompanyPlatform.Core.DTO.EmployeeBankDetails; 

namespace PayrollManagementAPI.Services.EmployeeBankDetails
{
    public interface IEmployeeBankDetailsService
    {
        //Task<EmployeeBankFullResponseDto> GetEmployeeAndBankByCodeAsync(string employeeCode);
        Task<EmployeeBankFullResponseDto> GetEmployeeAndBankByIdAsync(int  employeeId);
        Task<EmployeeBankDetailsDto> CreateAsync(CreateEmployeeBankDetailsDto dto);
        Task<EmployeeBankDetailsDto> UpdateAsync(int id, UpdateEmployeeBankDetailsDto dto);
        Task<bool> DeleteAsync(int id);

    }
}
