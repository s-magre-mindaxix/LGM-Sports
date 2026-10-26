using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using CompanyPlatform.Core.Services.Notification;


namespace CompanyPlatform.Core.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly IUserConnectionService _userConnectionService;

        public NotificationHub(IUserConnectionService userConnectionService)
        {
            _userConnectionService = userConnectionService;
        }

        public override Task OnConnectedAsync()
        {
            var employeeIdClaim = Context.User.FindFirst("EmployeeId");
            if (employeeIdClaim != null && int.TryParse(employeeIdClaim.Value, out int employeeId))
            {
                _userConnectionService.AddUserConnection(employeeId, Context.ConnectionId);
            }
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            var employeeIdClaim = Context.User.FindFirst("EmployeeId");
            if (employeeIdClaim != null && int.TryParse(employeeIdClaim.Value, out int employeeId))
            {
                _userConnectionService.RemoveUserConnection(employeeId);
            }
            return base.OnDisconnectedAsync(exception);
        }
    }
}
