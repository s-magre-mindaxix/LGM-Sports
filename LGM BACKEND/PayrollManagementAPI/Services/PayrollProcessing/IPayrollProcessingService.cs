using PayrollManagementAPI.DTO.Payroll;

namespace PayrollManagementAPI.Services.PayrollProcessing
{
    public interface IPayrollProcessingService
    {
        Task ProcessPayrollAsync(int year, int month);

        Task<IEnumerable<PayrollHistoryDto>> GetPayrollHistoryAsync();

        Task<PayrollDashboardDto> GetPayrollDashboardAsync(int year, int month);

        Task<byte[]> GeneratePayrollRegisterExcelAsync(int runId);

        Task<AttendanceCheckResultDto> GetAttendanceExceptionsAsync(int year, int month);

        Task<List<PendingLeaveRequestDto>> GetPendingLeaveRequestsAsync(int year, int month);

        Task<IEnumerable<object>> GetSalaryStructuresForReviewAsync();

        Task<MonthlySalaryRecordDto?> GetMonthlySalaryRecordByIdAsync(int id);
        Task<bool> UpdateMonthlySalaryRecordAsync(int id, UpdateMonthlySalaryRecordDto updateDto);

        Task<IEnumerable<SalaryRecordSummaryDto>> GetSalaryRecordsForRunAsync(int payrollRunId);

        Task<MonthlySalaryRecordForEditDto?> GetSalaryRecordForEditAsync(int recordId);

    }
}
