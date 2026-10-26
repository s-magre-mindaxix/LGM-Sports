namespace PayrollManagementAPI.Services.LeaveEncashment
{
    public interface ILeaveEncashmentService
    {
        Task<IEnumerable<LeaveEncashmentViewModel>> GetLeaveEncashmentsAsync(int financialYear);
        Task<CompanyPlatform.Core.Models.HRMS.LeaveEncashment> ProcessLeaveEncashmentForEmployeeAsync(int employeeId, int financialYear);

        Task<object> ProcessLeaveEncashmentForYearAsync(int financialYear);

        Task<LeaveEncashmentViewModel> GetMyLeaveEncashmentAsync(int employeeId, int financialYear);

    }
}
