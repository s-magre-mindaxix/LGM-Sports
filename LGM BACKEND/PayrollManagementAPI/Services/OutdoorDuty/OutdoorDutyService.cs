using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.OutdoorDuty;
using CompanyPlatform.Core.Hubs;
using PayrollManagementAPI.Services.Notification;
using CompanyPlatform.Core.Services.Notification;

namespace PayrollManagementAPI.Services.OutdoorDuty
{
    public class OutdoorDutyService : IOutdoorDutyService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<OutdoorDutyService> _logger;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IUserConnectionService _userConnectionService;
        private readonly INotificationService _notificationService;

        public OutdoorDutyService(
            ApplicationDBContext context, 
            ILogger<OutdoorDutyService> logger, 
            IHubContext<NotificationHub> hubContext,
            IUserConnectionService userConnectionService,
            INotificationService notificationService)
        {
            _context = context;
            _logger = logger;
            _hubContext = hubContext;
            _userConnectionService = userConnectionService;
            _notificationService = notificationService;
        }

        private IQueryable<OutdoorDutyViewDto> ProjectToViewDto(IQueryable<CompanyPlatform.Core.Models.OutdoorDuty> query)
        {
            return query.Select(od => new OutdoorDutyViewDto
            {
                Id = od.Id,
                EmployeeID = od.EmployeeID,
                EmployeeName = od.Employee.FirstName + " " + od.Employee.LastName,
                EmployeeCode = od.Employee.EmployeeCode,
                FromDate = od.FromDate,
                ToDate = od.ToDate,
                TotalDays = EF.Functions.DateDiffDay(od.FromDate, od.ToDate) + 1,
                Description = od.Description,
                AppliedDate = od.AppliedDate,
                Status = od.Status,
                ApproverID = od.ApproverID,
                ApproverName = od.Approver != null ? od.Approver.FirstName + " " + od.Approver.LastName : "N/A",
                ApprovalDate = od.ApprovalDate,
                ManagerRemarks = od.ManagerRemarks
            });
        }

        //public async Task<OutdoorDutyViewDto> CreateODAsync(CreateOutdoorDutyDto odDto, int employeeId)
        //{
        //    var employee = await _context.Employees.FindAsync(employeeId);
        //    if (employee == null || employee.ReportingTo == null)
        //    {
        //        throw new InvalidOperationException("Employee or Reporting Manager not found.");
        //    }

        //    var newOD = new Model.OutdoorDuty
        //    {
        //        EmployeeID = employeeId,
        //        VisitDate = odDto.VisitDate.Date,
        //        Description = odDto.Description,
        //        AppliedDate = DateTime.UtcNow,
        //        Status = "Pending",
        //        ApproverID = employee.ReportingTo,
        //    };

        //    _context.Tbl_OutdoorDuties.Add(newOD);
        //    await _context.SaveChangesAsync();
        //    _logger.LogInformation("New OD request created with ID {ODId} for EmployeeID {EmployeeId}", newOD.Id, employeeId);

        //    if (newOD.ApproverID.HasValue)
        //    {
        //        var managerId = newOD.ApproverID.Value;
        //        var message = $"{employee.FirstName} {employee.LastName} has submitted an Outdoor Duty request for {newOD.VisitDate:dd-MMM-yyyy} for your approval.";

        //        await _notificationService.CreateNotificationAsync(managerId, message);

        //        var managerConnectionId = _userConnectionService.GetUserConnection(managerId);
        //        if (!string.IsNullOrEmpty(managerConnectionId))
        //        {
        //            await _hubContext.Clients.Client(managerConnectionId).SendAsync("ReceiveNotification", message);
        //        }
        //    }

        //    var resultQuery = _context.Tbl_OutdoorDuties.Where(c => c.Id == newOD.Id);
        //    return await ProjectToViewDto(resultQuery).FirstAsync();
        //}

        public async Task<OutdoorDutyViewDto> CreateODAsync(CreateOutdoorDutyDto odDto, int employeeId)
        {
            // 1. Basic Validation
            if (odDto.ToDate < odDto.FromDate)
            {
                throw new ArgumentException("To Date cannot be earlier than From Date.");
            }

            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null || employee.ReportingTo == null)
            {
                throw new InvalidOperationException("Employee or Reporting Manager not found.");
            }

            // 2. Map Entity
            var newOD = new CompanyPlatform.Core.Models.OutdoorDuty
            {
                EmployeeID = employeeId,
                FromDate = odDto.FromDate.Date,
                ToDate = odDto.ToDate.Date,
                Description = odDto.Description,
                AppliedDate = DateTime.UtcNow,
                Status = "Pending",
                ApproverID = employee.ReportingTo,
            };

            _context.Tbl_OutdoorDuties.Add(newOD);
            await _context.SaveChangesAsync();
            _logger.LogInformation("New OD request created ID {ODId}", newOD.Id);

            // 3. Notification
            if (newOD.ApproverID.HasValue)
            {
                var managerId = newOD.ApproverID.Value;

                string dateString = newOD.FromDate == newOD.ToDate
                    ? $"{newOD.FromDate:dd-MMM-yyyy}"
                    : $"{newOD.FromDate:dd-MMM-yyyy} to {newOD.ToDate:dd-MMM-yyyy}";

                var message = $"{employee.FirstName} {employee.LastName} has submitted an Outdoor Duty request for {dateString}.";

                await _notificationService.CreateNotificationAsync(managerId, message);

                var managerConnectionId = _userConnectionService.GetUserConnection(managerId);
                if (!string.IsNullOrEmpty(managerConnectionId))
                {
                    await _hubContext.Clients.Client(managerConnectionId).SendAsync("ReceiveNotification", message);
                }
            }

            var resultQuery = _context.Tbl_OutdoorDuties.Where(c => c.Id == newOD.Id);
            return await ProjectToViewDto(resultQuery).FirstAsync();
        }

        public async Task<IEnumerable<OutdoorDutyViewDto>> GetODsByEmployeeIdAsync(int employeeId)
        {
            var query = _context.Tbl_OutdoorDuties
                .Where(od => od.EmployeeID == employeeId && !od.IsDeleted)
                .OrderByDescending(od => od.AppliedDate);
            return await ProjectToViewDto(query).ToListAsync();
        }

        public async Task<IEnumerable<OutdoorDutyViewDto>> GetPendingODsForManagerAsync(int managerId)
        {
            var query = _context.Tbl_OutdoorDuties
                .Where(od => od.ApproverID == managerId && od.Status == "Pending" && !od.IsDeleted)
                .OrderBy(od => od.AppliedDate);
            return await ProjectToViewDto(query).ToListAsync();
        }

        public async Task<OutdoorDutyViewDto> UpdateODStatusAsync(int odId, UpdateODStatusDto statusDto, int managerId)
        {
            var odRequest = await _context.Tbl_OutdoorDuties.FindAsync(odId);
            if (odRequest == null || odRequest.ApproverID != managerId)
            {
                throw new UnauthorizedAccessException("You are not authorized to update this request.");
            }

            if (odRequest.Status != "Pending")
            {
                throw new InvalidOperationException("This request has already been processed.");
            }

            odRequest.Status = statusDto.Status;
            odRequest.ManagerRemarks = statusDto.ManagerRemarks;
            odRequest.ApprovalDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            var manager = await _context.Employees.FindAsync(managerId);
            var managerName = manager != null ? $"{manager.FirstName} {manager.LastName}" : "Your manager";

            string dateString = odRequest.FromDate == odRequest.ToDate
                ? $"{odRequest.FromDate:dd-MMM-yyyy}"
                : $"{odRequest.FromDate:dd-MMM-yyyy} to {odRequest.ToDate:dd-MMM-yyyy}";

            var message = $"Your Outdoor Duty request for {dateString} has been {odRequest.Status} by {managerName}.";

            await _notificationService.CreateNotificationAsync(odRequest.EmployeeID, message);

            var employeeConnectionId = _userConnectionService.GetUserConnection(odRequest.EmployeeID);
            if (!string.IsNullOrEmpty(employeeConnectionId))
            {
                await _hubContext.Clients.Client(employeeConnectionId).SendAsync("ReceiveNotification", message);
            }

            var resultQuery = _context.Tbl_OutdoorDuties.Where(c => c.Id == odRequest.Id);
            return await ProjectToViewDto(resultQuery).FirstAsync();
        }

        public async Task<IEnumerable<OutdoorDutyViewDto>> GetAllProcessedODsAsync()
        {
            _logger.LogInformation("Fetching all processed outdoor duty requests for Admin/HR.");

            var query = _context.Tbl_OutdoorDuties
                .Where(od => (od.Status == "Approved" || od.Status == "Rejected") && !od.IsDeleted)
                .OrderByDescending(od => od.ApprovalDate ?? od.AppliedDate);

            return await ProjectToViewDto(query).ToListAsync();
        }
    }
}
