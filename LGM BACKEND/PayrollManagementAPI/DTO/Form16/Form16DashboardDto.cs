namespace PayrollManagementAPI.DTO.Form16
{
    // Main DTO that holds all data for the client-side PDF generation
    public class Form16PartBDto
    {
        public HeaderInfo Header { get; set; }
        public EmployerInfo Employer { get; set; }
        public EmployeeInfo Employee { get; set; }
        public SalaryDetails SalaryBreakdown { get; set; }
        public TaxComputation TaxCalculation { get; set; }
        public VerificationInfo Verification { get; set; }
    }

    public class HeaderInfo
    {
        public string CertificateNo { get; set; }
        public string LastUpdatedOn { get; set; }
        public string AssessmentYear { get; set; }
        public string PeriodFrom { get; set; }
        public string PeriodTo { get; set; }
    }

    public class EmployerInfo
    {
        public string CompanyName { get; set; }
        public string CompanyAddress { get; set; }
        public string CompanyEmail { get; set; }
        public string Pan { get; set; }
        public string Tan { get; set; }
        public string CitTdsAddress { get; set; }
    }

    public class EmployeeInfo
    {
        public string FullName { get; set; }
        public string Address { get; set; }
        public string Pan { get; set; }
        public bool IsOptingOutOf115BAC { get; set; }
    }

    public class SalaryDetails
    {
        public decimal GrossSalarySec17_1 { get; set; }
        public decimal PerquisitesSec17_2 { get; set; }
        public decimal ProfitsInLieuOfSalarySec17_3 { get; set; }
        public decimal SalaryFromOtherEmployers { get; set; } = 0;
        public decimal HraSec10_13A { get; set; }
        public decimal StandardDeduction16_ia { get; set; }
        public decimal EntertainmentAllowance16_ii { get; set; } = 0;
        public decimal ProfessionalTax16_iii { get; set; } = 0;
        public decimal IncomeFromHouseProperty { get; set; } = 0;
        public decimal IncomeFromOtherSources { get; set; }
        public decimal Deduction80C { get; set; }
        public decimal Deduction80D { get; set; }

        // --- CHANGE: Convert these from calculated '=>' to standard '{ get; set; }' properties ---
        public decimal TotalGrossSalary { get; set; }
        public decimal TotalExemptAllowances { get; set; }
        public decimal TotalSalaryAfterExemptions { get; set; }
        public decimal TotalDeductionsSec16 { get; set; }
        public decimal IncomeFromSalaries { get; set; }
        public decimal TotalOtherIncome { get; set; }
        public decimal GrossTotalIncome { get; set; }
        public decimal TotalChapterVIADeductions { get; set; }
        public decimal TotalTaxableIncome { get; set; }
    }

    public class TaxComputation
    {
        public decimal TaxOnTotalIncome { get; set; }
        public decimal Rebate87A { get; set; }
        public decimal Surcharge { get; set; } = 0;
        public decimal HealthAndEducationCess { get; set; }
        public decimal TdsDeductedByEmployer { get; set; }
        public decimal Relief89 { get; set; } = 0;

        public decimal TaxPayable { get; set; }
        public decimal NetTaxPayable { get; set; }
    }

    public class VerificationInfo
    {
        public string SignatoryName { get; set; }
        public string SignatorySonDaughterOf { get; set; }
        public string SignatoryDesignation { get; set; }
        public string Place { get; set; }
        public string Date { get; set; }
    }

    // --- Other DTOs for Dashboard and API communication ---
    public class Form16DashboardDto
    {
        public Form16SummaryDto Summary { get; set; }
        public List<Form16StatusDto> EmployeeStatusList { get; set; }
    }

    public class Form16SummaryDto
    {
        public int TotalEmployees { get; set; }
        public int PartAUploaded { get; set; }
        public int PartBGenerated { get; set; }
        public int Published { get; set; }
    }

    public class Form16StatusDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string Name { get; set; }
        public string Pan { get; set; }
        public string PartAStatus { get; set; }
        public string PartBStatus { get; set; }
        public string FinalStatus { get; set; }
    }

    public class EmployeeForm16ViewDto
    {
        public string FinancialYear { get; set; }
        public string Status { get; set; }
        public int? DownloadId { get; set; } // This is the Form16Status ID
    }

    public class UploadResultDto
    {
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public List<string> FailedFiles { get; set; } = new List<string>();
        public string Message { get; set; }
    }

    public class MonthlyEarningDto
    {
        public string ComponentName { get; set; }
        public decimal TotalAmount { get; set; }
    }
}