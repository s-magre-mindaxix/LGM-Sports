namespace CompanyPlatform.Core.DTO.EmployeeReports
{
    public class EmployeeMasterReportDto
    {
        public string EmployeeCode { get; set; }
        public string FullName { get; set; }
        public string EmailAddress { get; set; }
        public string Department { get; set; }
        public string Designation { get; set; }
        public DateTime? DateOfJoining { get; set; }
        public bool IsActive { get; set; }
    }

    public class HeadcountAnalysisDto
    {
        public string Department { get; set; }
        public int EmployeeCount { get; set; }
    }

    public class AttendanceSummaryDto
    {
        public string EmployeeCode { get; set; }
        public string FullName { get; set; }
        public int PresentDays { get; set; }
        public int AbsentDays { get; set; }
        public int HalfDays { get; set; }
        public int OnLeaveDays { get; set; }
    }

    public class LeaveBalanceReportDto
    {
        public string EmployeeCode { get; set; }
        public string FullName { get; set; }
        public string LeaveType { get; set; }
        public decimal AllocatedDays { get; set; }
        public decimal AvailedDays { get; set; }
        public decimal BalanceDays { get; set; }
    }

    public class DepartmentWiseAnalysisDto
    {
        public string Department { get; set; }
        public int TotalEmployees { get; set; }
    }

    public class MonthlySalaryRegisterDto
    {
        public string EmployeeCode { get; set; }
        public string FullName { get; set; }
        public string Department { get; set; }
        public decimal PayableDays { get; set; }
        public decimal LOPDays { get; set; }
        public decimal GrossEarnings { get; set; }
        public decimal TotalDeductions { get; set; }
        public decimal NetSalary { get; set; }
        // This will hold dynamic earnings like Basic, HRA, etc.
        public Dictionary<string, decimal> Earnings { get; set; } = new();
        // This will hold dynamic deductions like PF, ESI, etc.
        public Dictionary<string, decimal> Deductions { get; set; } = new();
    }

    public class CostCenterAnalysisDto
    {
        public string Department { get; set; }
        public decimal TotalCost { get; set; }
        public int EmployeeCount { get; set; }
    }

    public class OvertimeAnalysisDto
    {
        public string EmployeeCode { get; set; }
        public string FullName { get; set; }
        public string Department { get; set; }
        public decimal OvertimeAmount { get; set; }
    }

    public class BonusIncentiveReportDto
    {
        public string EmployeeCode { get; set; }
        public string FullName { get; set; }
        public string FinancialYear { get; set; }
        public decimal BonusAmount { get; set; }
        public string Status { get; set; }
    }

    public class BankTransferSummaryDto
    {
        public string EmployeeCode { get; set; }
        public string FullName { get; set; }
        public string BankName { get; set; }
        public string AccountNumber { get; set; }
        public string IFSCCode { get; set; }
        public decimal NetSalary { get; set; }
    }

    public class EmployerPfReportDto
    {
        public string EmployeeCode { get; set; }
        public string FullName { get; set; }
        public string Department { get; set; }
        public decimal GrossEarnings { get; set; }
        public decimal EmployerPF { get; set; }
    }

    public class DetailedAttendanceReportDto
    {
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public List<DailyAttendanceRecordDto> DailyRecords { get; set; }
    }

    public class DailyAttendanceRecordDto
    {
        public int DayOfMonth { get; set; }
        public string Status { get; set; }
        public string InTime { get; set; }
        public string OutTime { get; set; }
        public string TotalHours { get; set; }
    }

    public class ExpenseClaimReportDto
    {
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string ExpenseType { get; set; }
        public DateTime ClaimDate { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
        public decimal? ApprovedAmount { get; set; }
        public string? ApproverName { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string? Description { get; set; }
    }
}
