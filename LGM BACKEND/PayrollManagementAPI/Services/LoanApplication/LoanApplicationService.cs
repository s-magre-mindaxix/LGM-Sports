using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.LoanApplication;
using CompanyPlatform.Core.Models;
using LoanApplicationModel = CompanyPlatform.Core.Models.LoanApplication;

using PayrollManagementAPI.Services.LoanApplication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollManagementAPI.Services.Loan
{
    public class LoanApplicationService : ILoanApplicationService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<LoanApplicationService> _logger;

        public LoanApplicationService(ApplicationDBContext context, ILogger<LoanApplicationService> logger)
        {
            _context = context;
            _logger = logger;
        }
        public async Task<LoanApplicationViewDto> CreateLoanApplicationAsync(LoanApplicationCreateDto dto)
        {
            _logger.LogInformation("Creating loan application for Employee ID: {EmployeeId}", dto.EmployeeId);

            var loanType = await _context.Tbl_LoanMasters
                .FirstOrDefaultAsync(x => x.ID == dto.LoanTypeId && x.IsDeleted == false);

            if (loanType == null)
            {
                _logger.LogWarning("Invalid LoanTypeId {LoanTypeId}", dto.LoanTypeId);
                throw new Exception("Invalid Loan Type");
            }

            var newApp = new LoanApplicationModel
            {
                EmployeeID = dto.EmployeeId,
                LoanAmount = dto.LoanAmount,
                LoanTypeID = dto.LoanTypeId,
                TenureInMonths = dto.TenureInMonths,
                MonthlyDeduction = Math.Round(dto.LoanAmount / dto.TenureInMonths, 2),
                ApplicationDate = DateTime.UtcNow,
                Status = "Pending"
            };

            _context.Tbl_LoanApplications.Add(newApp);
            await _context.SaveChangesAsync();

            return new LoanApplicationViewDto
            {
                Id = newApp.ID,
                EmployeeId = newApp.EmployeeID,
                EmployeeName = "",
                LoanTypeId = newApp.LoanTypeID,
                LoanTypeName = loanType.LoanTypeName,
                LoanAmount = newApp.LoanAmount,
                TenureInMonths = newApp.TenureInMonths,
                MonthlyDeduction = newApp.MonthlyDeduction,
                ApplicationDate = newApp.ApplicationDate,
                Status = newApp.Status
            };
        }
        public async Task<List<LoanApplicationViewDto>> GetLoanHistoryByEmployeeIdAsync(int employeeId)
        {
            _logger.LogInformation("Fetching loan history for Employee ID: {EmployeeId}", employeeId);

            return await _context.Tbl_LoanApplications
                .Include(la => la.LoanType)
                .Include(la => la.Employee)
                .Where(la => la.EmployeeID == employeeId)
                .OrderByDescending(la => la.ApplicationDate)
                .Select(la => new LoanApplicationViewDto
                {
                    Id = la.ID,
                    EmployeeId = la.EmployeeID,
                    EmployeeCode = la.Employee.EmployeeCode,
                    EmployeeName = la.Employee.FirstName + " " + la.Employee.LastName,
                    LoanTypeId = la.LoanTypeID,
                    LoanTypeName = la.LoanType.LoanTypeName,
                    LoanAmount = la.LoanAmount,
                    TenureInMonths = la.TenureInMonths,
                    MonthlyDeduction = la.MonthlyDeduction,
                    ApplicationDate = la.ApplicationDate,
                    Status = la.Status
                }).ToListAsync();
        }

        public async Task<List<LoanApplicationViewDto>> GetPendingLoanApprovalsAsync(int managerId)
        {
            _logger.LogInformation("Fetching pending loan approvals for Manager ID: {ManagerId}", managerId);

            return await _context.Tbl_LoanApplications
                .Include(la => la.LoanType)
                .Include(la => la.Employee)
                .Where(la => la.Employee.ReportingTo == managerId && la.Status == "Pending")
                .OrderByDescending(la => la.ApplicationDate)
                .Select(la => new LoanApplicationViewDto
                {
                    Id = la.ID,
                    EmployeeId = la.EmployeeID,
                    EmployeeName = la.Employee.FirstName + " " + la.Employee.LastName,
                    LoanTypeId = la.LoanTypeID,
                    LoanTypeName = la.LoanType.LoanTypeName,
                    EmployeeCode = la.Employee.EmployeeCode,
                    LoanAmount = la.LoanAmount,
                    TenureInMonths = la.TenureInMonths,
                    MonthlyDeduction = la.MonthlyDeduction,
                    ApplicationDate = la.ApplicationDate,
                    Status = la.Status
                }).ToListAsync();
        }

       
        public async Task<bool> UpdateLoanStatusAsync(int loanApplicationId, LoanStatusUpdateDto dto)
        {
            var loanApp = await _context.Tbl_LoanApplications.FindAsync(loanApplicationId);

            if (loanApp == null)
            {
                _logger.LogWarning("Loan application with ID {LoanApplicationId} not found.", loanApplicationId);
                return false;
            }

            loanApp.Status = dto.Status;
            loanApp.ApprovedByUserID = dto.ApprovedByUserId;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Loan status updated to {Status} for Application ID {ID}", dto.Status, loanApplicationId);

            return true;
        }

        public async Task<LoanDashboardDto> GetDashboardAsync(int? managerId = null)
        {
            _logger.LogInformation("Building loan dashboard. Manager filter: {ManagerId}", managerId);

            var loansQuery = _context.Tbl_LoanApplications.AsQueryable();

            if (managerId.HasValue)
            {
                // only loans for employees that report to this manager
                loansQuery = loansQuery.Where(la => la.Employee.ReportingTo == managerId.Value);
            }

            // Active loans = approved loans
            var activeLoans = loansQuery.Where(la => la.Status == "Approved").ToList();

            // total outstanding: (naive) sum of LoanAmount - (MonthlyDeduction * paidInstallments)
            // since repayments table isn't specified, we assume none paid -> outstanding = LoanAmount
            var activeTotal = activeLoans.Sum(x => x.LoanAmount);

            // monthly recovery = sum of monthly deduction for approved loans
            var monthlyRecovery = activeLoans.Sum(x => x.MonthlyDeduction);

            // pending approvals
            var pendingCount = loansQuery.Count(la => la.Status == "Pending");

            // loan types summary (only non-deleted loantypes)
            var loanTypesSummary = await _context.Tbl_LoanMasters
                .Where(lt => lt.IsDeleted == false)
                .Select(lt => new LoanTypeSummaryDto
                {
                    LoanTypeId = lt.ID,
                    LoanTypeName = lt.LoanTypeName,
                    TotalLoans = _context.Tbl_LoanApplications.Count(la => la.LoanTypeID == lt.ID),
                    TotalAmount = _context.Tbl_LoanApplications
                                .Where(la => la.LoanTypeID == lt.ID)
                                .Sum(la => (decimal?)la.LoanAmount) ?? 0
                }).ToListAsync();

            return new LoanDashboardDto
            {
                ActiveLoansCount = activeLoans.Count,
                ActiveLoansTotalAmount = activeTotal,
                MonthlyRecoveryAmount = monthlyRecovery,
                PendingApprovalsCount = pendingCount,
                LoanTypes = loanTypesSummary
            };
        }

        public async Task<LoanDashboardStatsDto> GetDashboardStatsAsync(int userId, string role)
        {
            _logger.LogInformation("Building dashboard stats for UserId: {UserId}, Role: {Role}", userId, role);

            // Start query like your working method
            var loansQuery = _context.Tbl_LoanApplications
                                .Include(x => x.Employee)
                                .AsQueryable();

            // If employee → only his data
            if (role == "Employee")
            {
                loansQuery = loansQuery.Where(x => x.EmployeeID == userId);
            }

            // Active loans
            int activeLoans = await loansQuery.CountAsync(x => x.Status == "Approved");

            // Outstanding amount (sum of LoanAmount for approved loans)
            decimal totalOutstanding = await loansQuery
                .Where(x => x.Status == "Approved")
                .SumAsync(x => (decimal?)x.LoanAmount) ?? 0;

            // Monthly recovery
            decimal monthlyRecovery = await loansQuery
                .Where(x => x.Status == "Approved")
                .SumAsync(x => (decimal?)x.MonthlyDeduction) ?? 0;

            // Pending Approvals → only manager/admin
            int pendingApprovals = 0;

            if (role == "Manager" || role == "Admin")
            {
                pendingApprovals = await _context.Tbl_LoanApplications
                     .CountAsync(x => x.Status == "Pending");
            }

            return new LoanDashboardStatsDto
            {
                ActiveLoanCount = activeLoans,
                TotalOutstandingAmount = totalOutstanding,
                MonthlyRecovery = monthlyRecovery,
                PendingApprovals = pendingApprovals
            };
        }


        public async Task<List<LoanTypeSummaryDto>> GetLoanTypeSummaryAsync(int userId, string role)
        {
            _logger.LogInformation("Building loan type summary for UserId: {UserId}, Role: {Role}", userId, role);

            var loansQuery = _context.Tbl_LoanApplications
                                .Include(x => x.LoanType)
                                .Include(x => x.Employee)
                                .AsQueryable();

            // Employee sees only his loan types
            if (role == "Employee")
            {
                loansQuery = loansQuery.Where(x => x.EmployeeID == userId);
            }

            return await loansQuery
                .GroupBy(x => new { x.LoanTypeID, x.LoanType.LoanTypeName })
                .Select(g => new LoanTypeSummaryDto
                {
                    LoanTypeId = g.Key.LoanTypeID,
                    LoanTypeName = g.Key.LoanTypeName,
                    TotalLoans = g.Count(),
                    TotalAmount = g.Sum(a => (decimal?)a.LoanAmount) ?? 0
                })
                .ToListAsync();
        }

        public async Task<List<LoanRecoveryReportItemDto>> GenerateRecoveryReportAsync()
        {
            _logger.LogInformation("Generating loan recovery report.");

            var report = await _context.Tbl_LoanApplications
                .Include(la => la.Employee)
                .Include(la => la.LoanType)
                .Select(la => new
                {
                    Loan = la,
                    TotalPaid = _context.Tbl_LoanRepayments
                                    .Where(lr => lr.LoanApplicationID == la.ID)
                                    .Sum(lr => (decimal?)lr.AmountPaid) ?? 0
                })
                .Select(data => new LoanRecoveryReportItemDto
                {
                    LoanId = data.Loan.ID,
                    EmployeeId = data.Loan.EmployeeID,
                    EmployeeName = data.Loan.Employee.FirstName + " " + data.Loan.Employee.LastName,
                    LoanTypeName = data.Loan.LoanType.LoanTypeName,
                    TotalLoanAmount = data.Loan.LoanAmount,
                    TotalAmountPaid = data.TotalPaid,
                    BalanceAmount = data.Loan.LoanAmount - data.TotalPaid,
                    Status = data.Loan.Status
                })
                .ToListAsync();

            return report;
        }

        public async Task<List<OverdueLoanDto>> GetOverdueLoansAsync()
        {
            _logger.LogInformation("Fetching overdue loans.");

            var approvedLoans = await _context.Tbl_LoanApplications
                .Include(la => la.Employee)
                .Include(la => la.LoanType)
                .Where(la => la.Status == "Approved")
                .Select(la => new
                {
                    Loan = la,
                    PaidInstallments = _context.Tbl_LoanRepayments.Count(lr => lr.LoanApplicationID == la.ID),
                    LastPaymentDate = _context.Tbl_LoanRepayments
                                        .Where(lr => lr.LoanApplicationID == la.ID)
                                        .Max(lr => (DateTime?)lr.PaymentDate)
                })
                .ToListAsync();

            var overdueLoans = new List<OverdueLoanDto>();
            foreach (var item in approvedLoans)
            {
                int monthsPassed = ((DateTime.Now.Year - item.Loan.ApplicationDate.Year) * 12) + DateTime.Now.Month - item.Loan.ApplicationDate.Month;

                int expectedInstallments = Math.Min(monthsPassed, item.Loan.TenureInMonths);

                if (item.PaidInstallments < expectedInstallments && item.PaidInstallments < item.Loan.TenureInMonths)
                {
                    int missedInstallments = expectedInstallments - item.PaidInstallments;
                    overdueLoans.Add(new OverdueLoanDto
                    {
                        LoanId = item.Loan.ID,
                        EmployeeId = item.Loan.EmployeeID,
                        EmployeeName = item.Loan.Employee.FirstName + " " + item.Loan.Employee.LastName,
                        LoanTypeName = item.Loan.LoanType.LoanTypeName,
                        LoanAmount = item.Loan.LoanAmount,
                        MonthlyDeduction = item.Loan.MonthlyDeduction,
                        ExpectedInstallments = expectedInstallments,
                        PaidInstallments = item.PaidInstallments,
                        OverdueAmount = missedInstallments * item.Loan.MonthlyDeduction,
                        LastPaymentDate = item.LastPaymentDate
                    });
                }
            }

            return overdueLoans;
        }

        public async Task<LoanDashboardDto> GetEmployeeDashboardAsync(int employeeId)
        {
            _logger.LogInformation("Building loan dashboard for single Employee ID: {EmployeeId}", employeeId);

            var loansQuery = _context.Tbl_LoanApplications
                .Where(la => la.EmployeeID == employeeId);
            var activeLoans = await loansQuery
                .Where(la => la.Status == "Approved")
                .ToListAsync();
            var activeTotal = activeLoans.Sum(x => x.LoanAmount);
            var monthlyRecovery = activeLoans.Sum(x => x.MonthlyDeduction);
            var pendingCount = 0;

            var loanTypesSummary = await loansQuery
                .Include(la => la.LoanType)
                .Where(la => la.LoanType.IsDeleted == false)
                .GroupBy(la => new { la.LoanTypeID, la.LoanType.LoanTypeName })
                .Select(g => new LoanTypeSummaryDto
                {
                    LoanTypeId = g.Key.LoanTypeID,
                    LoanTypeName = g.Key.LoanTypeName,
                    TotalLoans = g.Count(),
                    TotalAmount = g.Sum(la => la.LoanAmount)
                }).ToListAsync();

            return new LoanDashboardDto
            {
                ActiveLoansCount = activeLoans.Count,
                ActiveLoansTotalAmount = activeTotal,
                MonthlyRecoveryAmount = monthlyRecovery,
                PendingApprovalsCount = pendingCount,
                LoanTypes = loanTypesSummary
            };
        }

        public async Task<List<LoanApplicationViewDto>> GetTeamLoanHistoryAsync(int managerId)
        {
            _logger.LogInformation("Fetching complete loan history for Manager ID: {ManagerId}", managerId);

            return await _context.Tbl_LoanApplications
                .Include(la => la.LoanType)
                .Include(la => la.Employee)
                // The only difference is we don't filter by status here
                .Where(la => la.Employee.ReportingTo == managerId)
                .OrderByDescending(la => la.ApplicationDate)
                .Select(la => new LoanApplicationViewDto
                {
                    Id = la.ID,
                    EmployeeId = la.EmployeeID,
                    EmployeeName = la.Employee.FirstName + " " + la.Employee.LastName,
                    LoanTypeId = la.LoanTypeID,
                    LoanTypeName = la.LoanType.LoanTypeName,
                    EmployeeCode = la.Employee.EmployeeCode,
                    LoanAmount = la.LoanAmount,
                    TenureInMonths = la.TenureInMonths,
                    MonthlyDeduction = la.MonthlyDeduction,
                    ApplicationDate = la.ApplicationDate,
                    Status = la.Status
                }).ToListAsync();
        }


    }
}
