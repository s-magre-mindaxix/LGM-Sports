using CompanyPlatform.Core.DTO.EmployeeReports;

namespace PayrollManagementAPI.Services.EmployeeReport
{
    public interface IEmployeeReportService
    {
        Task<IEnumerable<EmployeeMasterReportDto>> GenerateEmployeeMasterReportAsync();
        Task<IEnumerable<HeadcountAnalysisDto>> GenerateHeadcountAnalysisAsync();
        Task<IEnumerable<AttendanceSummaryDto>> GenerateAttendanceSummaryAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<LeaveBalanceReportDto>> GenerateLeaveBalanceReportAsync(int financialYear);
        Task<IEnumerable<DepartmentWiseAnalysisDto>> GenerateDepartmentWiseAnalysisAsync();

        Task<byte[]> GenerateEmployeeMasterReportExcelAsync();

        Task<byte[]> GenerateAttendanceSummaryExcelAsync(DateTime startDate, DateTime endDate);
        Task<byte[]> GenerateLeaveBalanceReportExcelAsync(int financialYear);

        Task<IEnumerable<MonthlySalaryRegisterDto>> GenerateMonthlySalaryRegisterAsync(int month, int year);
        Task<IEnumerable<CostCenterAnalysisDto>> GenerateCostCenterAnalysisAsync(int month, int year);

        Task<IEnumerable<BonusIncentiveReportDto>> GenerateBonusReportAsync(string financialYear);
        Task<IEnumerable<BankTransferSummaryDto>> GenerateBankTransferSummaryAsync(int month, int year);

        Task<byte[]> GenerateMonthlySalaryRegisterExcelAsync(int month, int year);
        Task<byte[]> GenerateBonusReportExcelAsync(string financialYear);
        Task<byte[]> GenerateBankTransferSummaryExcelAsync(int month, int year);

        Task<IEnumerable<EmployerPfReportDto>> GenerateEmployerPfReportAsync(int month, int year);

        Task<byte[]> GenerateEmployerPfReportExcelAsync(int month, int year);

        Task<List<DetailedAttendanceReportDto>> GenerateDetailedAttendanceReportAsync(int month, int year, int? employeeId = null);

        //Task<IEnumerable<LeaveEncashmentReportDto>> GenerateLeaveEncashmentReportAsync(int financialYear);
        //Task<byte[]> GenerateLeaveEncashmentReportExcelAsync(int financialYear);

        Task<IEnumerable<ExpenseClaimReportDto>> GenerateExpenseClaimReportAsync(DateTime startDate, DateTime endDate, string? status);

        Task<byte[]> GenerateExpenseClaimReportExcelAsync(DateTime startDate, DateTime endDate, string? status);
    }
}
