using System.Collections.Concurrent;

namespace CompanyPlatform.Core.Services.Notification
{
    public class UserConnectionService : IUserConnectionService
    {
        private readonly ConcurrentDictionary<int, string> _userConnections = new ConcurrentDictionary<int, string>();

        public void AddUserConnection(int employeeId, string connectionId)
        {
            _userConnections[employeeId] = connectionId;
        }

        public string GetUserConnection(int employeeId)
        {
            _userConnections.TryGetValue(employeeId, out var connectionId);
            return connectionId;
        }

        public void RemoveUserConnection(int employeeId)
        {
            _userConnections.TryRemove(employeeId, out _);
        }
    }
}
