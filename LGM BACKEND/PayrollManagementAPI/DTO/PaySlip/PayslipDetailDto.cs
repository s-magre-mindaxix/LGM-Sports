using System.Globalization;

namespace PayrollManagementAPI.DTO.PaySlip
{
    public class PayslipDetailDto
    {
        public int PayslipId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }

        public int DepartmentId { get; set; }
        public string Department { get; set; }

        public decimal GrossSalary { get; set; }
        public decimal NetSalary { get; set; }

        public bool EmailSent { get; set; }
        public bool Downloaded { get; set; }

        public string PdfFilePath { get; set; }
    }

    public class PayslipSummaryDto
    {
        public int TotalGenerated { get; set; }
        public int EmailSent { get; set; }
        public int TotalDownloads { get; set; }
    }

    public class PayslipGenerateResponseDto
    {
        public int PayslipId { get; set; }
        public string PdfFilePath { get; set; }
        public string Message { get; set; }

        public bool EmailSent { get; set; }
    }

    public class EmployeePayslipListDto
    {
        public int PayslipId { get; set; }
        public string MonthYear { get; set; }
        public decimal NetSalary { get; set; }
        public bool Downloaded { get; set; }
    }

    public class PayrollRunDto
    {
        public int Id { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName
        {
            get
            {
                // This will convert the month number (e.g., 3) to the month name ("March")
                return CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(this.Month);
            }
        }
    }


}
