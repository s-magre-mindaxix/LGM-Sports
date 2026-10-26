namespace PayrollManagementAPI.Services.Gratuity
{
    public interface IGratuityService
    {
        Task<CompanyPlatform.Core.Models.HRMS.Gratuity> CalculateGratuityForEmployee(int employeeId);

        Task ProcessGratuityForAllEligibleEmployees();

        Task<GratuityResponse> GetGratuityDashboardData(string userEmail, bool isAdmin);

        Task UpdateGratuityForSingleEmployee(int employeeId);

    }
}
