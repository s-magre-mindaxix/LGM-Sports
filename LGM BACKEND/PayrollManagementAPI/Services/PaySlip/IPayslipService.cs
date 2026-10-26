using PayrollManagementAPI.DTO.PaySlip;

namespace PayrollManagementAPI.Services.PaySlip
{
    public interface IPayslipService
    {
        Task<PayslipDto> GetPayslipDataAsync(int employeeId, int year, int month);

        Task<PayslipGenerateResponseDto> GeneratePayslipAsync(int payrollRunId, int employeeId);
        Task<IEnumerable<PayslipDetailDto>> GenerateAllPayslipsAsync(int payrollRunId);

        Task<IEnumerable<PayslipDetailDto>> GetAllPayslipsForRunAsync(int payrollRunId);
        Task<PayslipSummaryDto> GetPayslipSummaryAsync(int payrollRunId);

        Task<byte[]> DownloadPayslipAsync(int payslipId, int loggedInEmployeeId, string role);
       // Task<byte[]> DownloadAllPayslipsZipAsync(int payrollRunId);

        Task<IEnumerable<EmployeePayslipListDto>> GetEmployeePayslipHistoryAsync(int employeeId);

        Task<PayrollRunDto> GetActivePayrollRunAsync();

        Task MarkAsDownloadedAsync(int payslipId);

        Task<IEnumerable<PayrollRunDto>> GetAllPayrollRunsAsync();

        Task<AttendanceReportDto> GetMonthlyAttendanceAsync(int employeeId, int year, int month);

        Task<MonthlyWorkDaysDto> GetMonthlyWorkDaysSummaryAsync(int year, int month);

        Task<IEnumerable<LeaveBalanceDto>> GetLeaveBalanceForPayslipAsync(int employeeId, int year, int month);

        Task<AdvanceBalanceDto> GetAdvanceBalanceForPayslipAsync(int employeeId, int year, int month);

        Task EmailUploadedPayslipAsync(IFormFile file, int payslipId, int employeeId, int payrollRunId);

    }
}
