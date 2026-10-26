using System.ComponentModel.DataAnnotations;

namespace PayrollManagementAPI.DTO.Payroll
{
    public class MonthlySalaryComponentDetailDto
    {
        public long Id { get; set; }
        public string ComponentName { get; set; }
        public string ComponentType { get; set; } // "Earning" or "Deduction"
        public decimal Amount { get; set; }
    }

    public class MonthlySalaryRecordDto
    {
        public int Id { get; set; }
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; } // Useful for the UI
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal PayableDays { get; set; }
        public decimal LOPDays { get; set; }
        public decimal GrossEarnings { get; set; }
        public decimal TotalDeductions { get; set; }
        public decimal NetSalary { get; set; }
        public string? Remarks { get; set; }

        public decimal PresentDays { get; set; }
        public decimal WeeklyOffAndHolidays { get; set; }
        public decimal CasualLeaveDays { get; set; }
        public virtual ICollection<MonthlySalaryComponentDetailDto> ComponentDetails { get; set; }
    }

    public class UpdateMonthlySalaryRecordDto
    {
        public decimal PayableDays { get; set; }
        public decimal LOPDays { get; set; }
        public string? Remarks { get; set; }

        public decimal PresentDays { get; set; }
        public decimal WeeklyOffAndHolidays { get; set; }
        public decimal CasualLeaveDays { get; set; }
        public List<ComponentDetailUpdateDto> ComponentDetails { get; set; }
    }

    public class ComponentDetailUpdateDto
    {
        public long Id { get; set; }
        public decimal Amount { get; set; }
    }

    public class SalaryRecordSummaryDto
    {
        public int Id { get; set; } // This is the MonthlySalaryRecord ID
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public decimal NetSalary { get; set; }
    }

    public class MonthlySalaryComponentDetailForEditDto
    {
        public long Id { get; set; }

        public int SalaryComponentId { get; set; }

        public string ComponentName { get; set; }
        public string ComponentType { get; set; }
        public decimal Amount { get; set; } 

        public bool IsProrated { get; set; }

        public decimal? OriginalMonthlyAmount { get; set; }
    }

    // DTO for sending the entire salary record to the edit form
    public class MonthlySalaryRecordForEditDto
    {
        public int Id { get; set; }
        public string EmployeeName { get; set; }
        public decimal PayableDays { get; set; }
        public decimal LOPDays { get; set; }
        public string? Remarks { get; set; }

        public decimal PresentDays { get; set; }
        public decimal WeeklyOffAndHolidays { get; set; }
        public decimal CasualLeaveDays { get; set; }

        public int TotalDaysInMonth { get; set; }

        public List<MonthlySalaryComponentDetailForEditDto> ComponentDetails { get; set; }
    }
}
