namespace CompanyPlatform.Core.Services.Notification
{
    public interface IUserConnectionService
    {
        void AddUserConnection(int employeeId, string connectionId);
        void RemoveUserConnection(int employeeId);
        string GetUserConnection(int employeeId);
    }
}
