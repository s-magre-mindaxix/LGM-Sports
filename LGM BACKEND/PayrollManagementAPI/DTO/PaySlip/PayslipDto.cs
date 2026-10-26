namespace PayrollManagementAPI.DTO.PaySlip
{
    public class PayslipDto
    {
        // Company Details
        public string CompanyName { get; set; } = "GAXCE SENSORS";
        public string CompanyAddress { get; set; } = " CHAITANYA NAGAR, RM CAPITAL, 3RD FLOOR OFFICE NO, 302, PUNE - SATARA RD, DHANKAWADI, PUNE, MAHARASHTRA 411043";

        public string Place { get; set; } = "Pune";

        //public string CompanyName { get; set; } 
        //public string CompanyAddress { get; set; }

        //public string Place { get; set; } 
        // Payslip Header
        public string PayslipMonthYear { get; set; }
        public DateTime DateOfIssue { get; set; }

        // Employee Details
        public string EmployeeCode { get; set; }
        public string FullName { get; set; }
        public string Designation { get; set; }
        public DateTime? DateOfJoining { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string EmailId { get; set; }
        public string Department { get; set; }

        public string PfNumber { get; set; }
        public string UanNumber { get; set; }
        public string EsicNumber { get; set; }


        // Salary Summary
        public int TotalDaysInMonth { get; set; }
        public decimal PayableDays { get; set; }
        public decimal LOPDays { get; set; }

        // Earnings and Deductions
        public List<PayslipEarningComponent> Earnings { get; set; } = new List<PayslipEarningComponent>();
        public List<PayslipComponent> Deductions { get; set; } = new List<PayslipComponent>();

        public List<PayslipComponent> EmployerContributions { get; set; } = new List<PayslipComponent>();

        public decimal PresentDays { get; set; }
        public decimal WeeklyOffAndHolidays { get; set; }
        public decimal CasualLeaveDays { get; set; }

        // Totals
        public decimal GrossEarnings { get; set; }
        public decimal TotalDeductions { get; set; }
        public decimal NetSalary { get; set; }
        public string NetSalaryInWords { get; set; }

        public PayslipDto()
        {
            Earnings = new List<PayslipEarningComponent>();
            Deductions = new List<PayslipComponent>();
        }
    }

    public class PayslipEarningComponent
    {
        public string Name { get; set; }
        public decimal ActualAmount { get; set; }  // Represents "Actual Rate of Salary"
        public decimal EarnedAmount { get; set; }  // Represents "Normal Earning"
    }

    public class PayslipComponent
    {
        public string Name { get; set; }
        public decimal Amount { get; set; }
    }
}
