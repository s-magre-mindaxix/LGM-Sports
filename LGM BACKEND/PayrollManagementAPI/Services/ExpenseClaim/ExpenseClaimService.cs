using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.ExpenseClaim;
using CompanyPlatform.Core.Hubs;
using PayrollManagementAPI.Services.Notification;
using System.Text;
using CompanyPlatform.Core.Hubs;
using CompanyPlatform.Core.Services.Notification;

namespace PayrollManagementAPI.Services.ExpenseClaim
{
    public class ExpenseClaimService : IExpenseClaimService
    {
        private readonly ApplicationDBContext _context;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly ILogger<ExpenseClaimService> _logger;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IUserConnectionService _userConnectionService;
        private readonly INotificationService _notificationService;

        public ExpenseClaimService(ApplicationDBContext context, IWebHostEnvironment hostingEnvironment, ILogger<ExpenseClaimService> logger, IHubContext<NotificationHub> hubContext, IUserConnectionService userConnectionService, INotificationService notificationService)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _logger = logger;
            _hubContext = hubContext;
            _userConnectionService = userConnectionService;
            _notificationService = notificationService;
        }

        private IQueryable<ExpenseClaimViewDto> ProjectToViewDto(IQueryable<CompanyPlatform.Core.Models.ExpenseClaim> query)
        {
            return query.Select(c => new ExpenseClaimViewDto
            {
                Id = c.Id,
                EmployeeID = c.EmployeeID,
                EmployeeName = c.Employee.FirstName + " " + c.Employee.LastName,
                EmployeeCode = c.Employee.EmployeeCode,
                ExpenseTypeID = c.ExpenseTypeID,
                ExpenseTypeName = c.ExpenseType.ExpenseTypeName,
                Amount = c.Amount,
                ApprovedAmount = c.ApprovedAmount,
                ClaimDate = c.ClaimDate,
                AppliedDate = c.AppliedDate,
                Description = c.Description,
                Status = c.Status,
                ApproverID = c.ApproverID,
                ApproverName = c.Approver != null ? c.Approver.FirstName + " " + c.Approver.LastName : "N/A",
                ApprovalDate = c.ApprovalDate,
                ManagerRemarks = c.ManagerRemarks,
                ReceiptFilePath = c.ReceiptFilePath
            });
        }

        public async Task<ExpenseClaimViewDto> CreateClaimAsync(CreateExpenseClaimDto claimDto, int employeeId)
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null || employee.ReportingTo == null)
            {
                throw new InvalidOperationException("Employee or Reporting Manager not found.");
            }

            string uniqueFileName = null;
            if (claimDto.ReceiptFile != null)
            {
                string uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "receipts");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
                uniqueFileName = Guid.NewGuid().ToString() + "_" + claimDto.ReceiptFile.FileName;
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await claimDto.ReceiptFile.CopyToAsync(fileStream);
                }
            }

            var newClaim = new CompanyPlatform.Core.Models.ExpenseClaim
            {
                EmployeeID = employeeId,
                ExpenseTypeID = claimDto.ExpenseTypeID,
                Amount = claimDto.Amount,
                ClaimDate = claimDto.ClaimDate,
                Description = claimDto.Description,
                AppliedDate = DateTime.UtcNow,
                Status = "Pending",
                ApproverID = employee.ReportingTo,
                ReceiptFilePath = uniqueFileName != null ? $"/receipts/{uniqueFileName}" : null
            };

            _context.Tbl_ExpenseClaims.Add(newClaim);
            await _context.SaveChangesAsync();

            _logger.LogInformation("New expense claim created with ID {ClaimId} for EmployeeID {EmployeeId}", newClaim.Id, employeeId);

            if (newClaim.ApproverID.HasValue)
            {
                var managerId = newClaim.ApproverID.Value;
                var message = $"{employee.FirstName} {employee.LastName} has submitted an expense claim of ₹{newClaim.Amount:N2} for your approval.";

                await _notificationService.CreateNotificationAsync(managerId, message);

                var managerConnectionId = _userConnectionService.GetUserConnection(managerId);
                if (!string.IsNullOrEmpty(managerConnectionId))
                {
                    await _hubContext.Clients.Client(managerConnectionId).SendAsync("ReceiveNotification", message);
                }
            }

            var resultQuery = _context.Tbl_ExpenseClaims.Where(c => c.Id == newClaim.Id);
            return await ProjectToViewDto(resultQuery).FirstAsync();
        }

        public async Task<IEnumerable<ExpenseClaimViewDto>> GetClaimsByEmployeeIdAsync(int employeeId)
        {
            var claimsQuery = _context.Tbl_ExpenseClaims
                .Where(c => c.EmployeeID == employeeId && !c.IsDeleted)
                .OrderByDescending(c => c.AppliedDate);

            return await ProjectToViewDto(claimsQuery).ToListAsync();
        }

        public async Task<IEnumerable<ExpenseClaimViewDto>> GetPendingClaimsForManagerAsync(int managerId)
        {
            var claimsQuery = _context.Tbl_ExpenseClaims
                .Where(c => c.ApproverID == managerId && c.Status == "Pending" && !c.IsDeleted)
                .OrderBy(c => c.AppliedDate);

            return await ProjectToViewDto(claimsQuery).ToListAsync();
        }

        public async Task<ExpenseClaimViewDto> UpdateClaimStatusAsync(int claimId, UpdateExpenseStatusDto statusDto, int managerId)
        {
            var claim = await _context.Tbl_ExpenseClaims.FindAsync(claimId);
            if (claim == null || claim.ApproverID != managerId)
            {
                throw new UnauthorizedAccessException("You are not authorized to update this claim.");
            }

            if (claim.Status != "Pending")
            {
                throw new InvalidOperationException("This claim has already been processed.");
            }

            claim.Status = statusDto.Status;
            claim.ManagerRemarks = statusDto.ManagerRemarks;
            claim.ApprovalDate = DateTime.UtcNow;

            if (claim.Status == "Approved")
            {
                if (statusDto.ApprovedAmount.HasValue && statusDto.ApprovedAmount.Value > 0)
                {
                    claim.ApprovedAmount = statusDto.ApprovedAmount.Value;
                }
                else
                {
                    claim.ApprovedAmount = claim.Amount;
                }
            }
            else 
            {
                claim.ApprovedAmount = null; 
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Expense claim status updated for ID {ClaimId} to {Status} by ManagerID {ManagerId}", claim.Id, claim.Status, managerId);

            var manager = await _context.Employees.FindAsync(managerId);
            var managerName = manager != null ? $"{manager.FirstName} {manager.LastName}" : "Your manager";

            string message;
            if (claim.Status == "Approved")
            {
                decimal finalAmount = claim.ApprovedAmount ?? claim.Amount;

                if (finalAmount < claim.Amount)
                {
                    message = $"Your expense claim of ₹{claim.Amount:N2} has been partially approved for ₹{finalAmount:N2} by {managerName}.";
                }
                else
                {
                    message = $"Your expense claim for ₹{claim.Amount:N2} has been Approved by {managerName}.";
                }
            }
            else 
            {
                message = $"Your expense claim for ₹{claim.Amount:N2} has been Rejected by {managerName}.";
            }

            await _notificationService.CreateNotificationAsync(claim.EmployeeID, message);

            var employeeConnectionId = _userConnectionService.GetUserConnection(claim.EmployeeID);
            if (!string.IsNullOrEmpty(employeeConnectionId))
            {
                await _hubContext.Clients.Client(employeeConnectionId).SendAsync("ReceiveNotification", message);
            }

            var resultQuery = _context.Tbl_ExpenseClaims.Where(c => c.Id == claim.Id);
            return await ProjectToViewDto(resultQuery).FirstAsync();
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync(int employeeId, bool isAdminOrHr)
        {
            _logger.LogInformation("Fetching dashboard stats for EmployeeId: {EmployeeId}, IsAdminOrHr: {IsAdminOrHr}", employeeId, isAdminOrHr);

            IQueryable<CompanyPlatform.Core.Models.ExpenseClaim> baseQuery = _context.Tbl_ExpenseClaims.Where(c => !c.IsDeleted);

            if (!isAdminOrHr)
            {
                baseQuery = baseQuery.Where(c => c.EmployeeID == employeeId);
            }

            var pendingClaims = await baseQuery.CountAsync(c => c.Status == "Pending");

            var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var approvedAmount = await baseQuery
                .Where(c => c.Status == "Approved" && c.ApprovalDate >= startOfMonth)
                .SumAsync(c => (decimal?)c.Amount) ?? 0;

            var processedClaims = await baseQuery
                .Where(c => c.AppliedDate >= startOfMonth)
                .CountAsync();

            var rejectedClaims = await baseQuery.CountAsync(c => c.Status == "Rejected");

            var expenseCategories = await baseQuery
                .Include(c => c.ExpenseType)
                .GroupBy(c => c.ExpenseType.ExpenseTypeName)
                .Select(g => new ExpenseCategoryStatDto
                {
                    CategoryName = g.Key,
                    ClaimCount = g.Count(),
                    TotalAmount = g.Sum(c => c.Amount)
                })
                .OrderByDescending(s => s.TotalAmount)
                .ToListAsync();

            return new DashboardStatsDto
            {
                PendingClaims = pendingClaims,
                ApprovedAmount = approvedAmount,
                ProcessedClaims = processedClaims,
                RejectedClaims = rejectedClaims,
                ExpenseCategories = expenseCategories
            };
        }

        public async Task<IEnumerable<ExpenseClaimViewDto>> GetAllProcessedClaimsAsync()
        {
            _logger.LogInformation("Service fetching all processed claims for Admin/HR.");

            var claimsQuery = _context.Tbl_ExpenseClaims
                .Where(c => (c.Status == "Approved" || c.Status == "Rejected") && !c.IsDeleted)
                .OrderByDescending(c => c.ApprovalDate ?? c.AppliedDate); 

            return await ProjectToViewDto(claimsQuery).ToListAsync();
        }

        public async Task<byte[]> GenerateExpenseReportAsync(DateTime startDate, DateTime endDate)
        {
            _logger.LogInformation("Generating expense report from {StartDate} to {EndDate}", startDate, endDate);

            var adjustedEndDate = endDate.Date.AddDays(1).AddTicks(-1);

            var claims = await _context.Tbl_ExpenseClaims
                .Where(c => c.AppliedDate >= startDate.Date && c.AppliedDate <= adjustedEndDate)
                .Include(c => c.Employee)
                .Include(c => c.ExpenseType)
                .Include(c => c.Approver)
                .OrderBy(c => c.AppliedDate)
                .ToListAsync();

            var builder = new StringBuilder();
            builder.AppendLine("ClaimID,EmployeeName,EmployeeCode,ExpenseType,Amount,ClaimDate,AppliedDate,Status,Description,ApproverName,ManagerRemarks");

            foreach (var claim in claims)
            {
                builder.AppendLine(
                    $"{claim.Id}," +
                    $"\"{claim.Employee.FirstName} {claim.Employee.LastName}\"," +
                    $"{claim.Employee.EmployeeCode}," +
                    $"\"{claim.ExpenseType.ExpenseTypeName}\"," +
                    $"{claim.Amount}," +
                    $"{claim.ClaimDate:yyyy-MM-dd}," +
                    $"{claim.AppliedDate:yyyy-MM-dd}," +
                    $"{claim.Status}," +
                    $"{claim.Description},"+
                    $"\"{claim.Approver?.FirstName} {claim.Approver?.LastName}\"," +
                    $"\"{claim.ManagerRemarks?.Replace("\"", "\"\"")}\"" 
                );
            }

            return Encoding.UTF8.GetBytes(builder.ToString());
        }

        public async Task<int> BulkApproveClaimsAsync(List<int> claimIds, int managerId)
        {
            _logger.LogInformation("Manager {ManagerId} attempting to bulk approve {Count} claims.", managerId, claimIds.Count);

            var claimsToApprove = await _context.Tbl_ExpenseClaims
                .Where(c => claimIds.Contains(c.Id) && c.ApproverID == managerId && c.Status == "Pending")
                .ToListAsync();

            if (!claimsToApprove.Any())
            {
                _logger.LogWarning("Bulk approve failed: No valid claims found for Manager {ManagerId}.", managerId);
                return 0;
            }

            foreach (var claim in claimsToApprove)
            {
                claim.Status = "Approved";
                claim.ApprovalDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully bulk approved {Count} claims for Manager {ManagerId}.", claimsToApprove.Count, managerId);
            return claimsToApprove.Count;
        }
    }
}
