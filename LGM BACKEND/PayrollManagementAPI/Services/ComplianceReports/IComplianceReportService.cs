namespace PayrollManagementAPI.Services.ComplianceReports
{
    public interface IComplianceReportService
    {
        Task<byte[]> GeneratePfEcrFileAsync(int payrollRunId);

        Task<byte[]> GenerateEsicReportExcelAsync(int payrollRunId);

        Task<byte[]> GenerateProfessionalTaxReportExcelAsync(int payrollRunId);

        Task<byte[]> GenerateTdsReportExcelAsync(int payrollRunId);

        //  Task<string> GetPfEcrTextAsync(int payrollRunId);
    }
}
