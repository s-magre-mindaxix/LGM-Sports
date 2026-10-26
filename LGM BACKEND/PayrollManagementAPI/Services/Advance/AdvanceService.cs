using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.Advance;
using CompanyPlatform.Core.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PayrollManagementAPI.Services.Advance
{
    public class AdvanceService : IAdvanceService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<AdvanceService> _logger;

        public AdvanceService(ApplicationDBContext context, ILogger<AdvanceService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<AdvanceViewDto> CreateAdvanceAsync(AdvanceCreateDto dto)
        {
            _logger.LogInformation("Attempting to create a new advance for EmployeeID: {EmployeeID}", dto.EmployeeID);

            var employeeExists = await _context.Employees.AnyAsync(e => e.ID == dto.EmployeeID && !e.IsDeleted);
            if (!employeeExists)
            {
                _logger.LogWarning("Creation failed. Employee with ID {EmployeeID} not found.", dto.EmployeeID);
                throw new Exception($"Employee with ID {dto.EmployeeID} not found.");
            }

            var advance = new CompanyPlatform.Core.Models.Advance
            {
                EmployeeID = dto.EmployeeID,
                Amount = dto.Amount,
                RequestDate = dto.RequestDate.ToUniversalTime(),
                Reason = dto.Reason,
                Status = "Approved",
                StatusDate = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.Tbl_Advances.Add(advance);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully created advance with ID: {AdvanceID}", advance.ID);

            // Return the newly created data by calling the GetById method
            return await GetAdvanceByIdAsync(advance.ID);
        }

        public async Task<bool> DeleteAdvanceAsync(int advanceId)
        {
            _logger.LogInformation("Attempting to delete advance with ID: {AdvanceID}", advanceId);
            var advance = await _context.Tbl_Advances.FindAsync(advanceId);
            if (advance == null || advance.IsDeleted)
            {
                _logger.LogWarning("Advance with ID: {AdvanceID} not found or already deleted.", advanceId);
                return false;
            }

            // This is the Soft Delete implementation
            advance.IsDeleted = true;
            await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully soft-deleted advance with ID: {AdvanceID}", advanceId);
            return true;
        }

        public async Task<IEnumerable<AdvanceViewDto>> GetAllAdvancesAsync()
        {
            _logger.LogInformation("Fetching all active advances with repayment details.");
            return await _context.Tbl_Advances
                .Where(a => !a.IsDeleted)
                .OrderByDescending(a => a.RequestDate)
                .Select(a => new AdvanceViewDto
                {
                    ID = a.ID,
                    EmployeeID = a.EmployeeID,
                    EmployeeName = $"{a.Employee.FirstName} {a.Employee.LastName}",
                    Amount = a.Amount,
                    RequestDate = a.RequestDate.ToString("dd-MMM-yyyy"),
                    Reason = a.Reason,
                    Status = a.Status,
                    TotalRepaid = _context.Tbl_AdvanceRepayments.Where(r => r.AdvanceID == a.ID).Sum(r => r.RepaymentAmount),
                    Balance = a.Amount - _context.Tbl_AdvanceRepayments.Where(r => r.AdvanceID == a.ID).Sum(r => r.RepaymentAmount)
                })
                .ToListAsync();
        }

        public async Task<AdvanceRepayment> AddRepaymentAsync(int advanceId, AdvanceRepaymentCreateDto dto)
        {
            _logger.LogInformation("Adding repayment for AdvanceID: {AdvanceID}", advanceId);
            var advance = await _context.Tbl_Advances.FirstOrDefaultAsync(a => a.ID == advanceId && !a.IsDeleted);
            if (advance == null)
            {
                _logger.LogWarning("Advance record not found for AdvanceID: {AdvanceID}", advanceId);
                throw new Exception("Advance record not found.");
            }

            var totalRepaid = await _context.Tbl_AdvanceRepayments
                .Where(r => r.AdvanceID == advanceId)
                .SumAsync(r => r.RepaymentAmount);

            if ((totalRepaid + dto.RepaymentAmount) > advance.Amount)
            {
                _logger.LogWarning("Overpayment attempt on AdvanceID: {AdvanceID}", advanceId);
                throw new Exception("Repayment amount exceeds the outstanding balance.");
            }

            var repayment = new AdvanceRepayment
            {
                AdvanceID = advanceId,
                RepaymentAmount = dto.RepaymentAmount,
                RepaymentDate = dto.RepaymentDate.ToUniversalTime(),
                Notes = dto.Notes,
                CreatedByEmployeeId = dto.CreatedByEmployeeId
            };

            _context.Tbl_AdvanceRepayments.Add(repayment);
            await _context.SaveChangesAsync();

            if ((totalRepaid + dto.RepaymentAmount) == advance.Amount)
            {
                advance.Status = "Paid";
                await _context.SaveChangesAsync();
                _logger.LogInformation("AdvanceID: {AdvanceID} is now fully paid.", advanceId);
            }
            else if (advance.Status != "Partially Paid")
            {
                advance.Status = "Partially Paid";
                await _context.SaveChangesAsync();
            }

            return repayment;
        }

        public async Task<AdvanceHistoryDto> GetAdvanceHistoryAsync(int advanceId)
        {
            _logger.LogInformation("Fetching history for AdvanceID: {AdvanceID}", advanceId);
            var advance = await _context.Tbl_Advances
                .Include(a => a.Employee)
                .FirstOrDefaultAsync(a => a.ID == advanceId && !a.IsDeleted);

            if (advance == null) return null;

            var repayments = await _context.Tbl_AdvanceRepayments
                .Include(r => r.CreatedByEmployee)
                .Where(r => r.AdvanceID == advanceId)
                .OrderBy(r => r.RepaymentDate)
                .Select(r => new AdvanceRepaymentViewDto
                {
                    RepaymentAmount = r.RepaymentAmount,
                    RepaymentDate = r.RepaymentDate.ToString("dd-MMM-yyyy HH:mm"),
                    Notes = r.Notes,
                    CreatedByName = $"{r.CreatedByEmployee.FirstName} {r.CreatedByEmployee.LastName}"
                })
                .ToListAsync();

            var totalRepaid = repayments.Sum(r => r.RepaymentAmount);

            return new AdvanceHistoryDto
            {
                AdvanceId = advance.ID,
                EmployeeName = $"{advance.Employee.FirstName} {advance.Employee.LastName}",
                OriginalAmount = advance.Amount,
                RequestDate = advance.RequestDate.ToString("dd-MMM-yyyy"),
                Reason = advance.Reason,
                Repayments = repayments,
                TotalRepaid = totalRepaid,
                Balance = advance.Amount - totalRepaid
            };
        }

        public async Task<AdvanceViewDto> GetAdvanceByIdAsync(int advanceId)
        {
            _logger.LogInformation("Fetching advance by ID: {AdvanceID}", advanceId);
            // Projection is done directly in the query.
            var advance = await _context.Tbl_Advances
                .Where(a => a.ID == advanceId && !a.IsDeleted)
                .Select(a => new AdvanceViewDto
                {
                    ID = a.ID,
                    EmployeeID = a.EmployeeID,
                    EmployeeName = $"{a.Employee.FirstName} {a.Employee.LastName}",
                    Amount = a.Amount,
                    RequestDate = a.RequestDate.ToString("dd-MMM-yyyy"),
                    Reason = a.Reason,
                    Status = a.Status,
                    StatusDate = a.StatusDate.HasValue ? a.StatusDate.Value.ToString("dd-MMM-yyyy") : null,
                    ProcessedByName = a.ProcessedByEmployee != null ? $"{a.ProcessedByEmployee.FirstName} {a.ProcessedByEmployee.LastName}" : "N/A"
                })
                .FirstOrDefaultAsync();

            if (advance == null)
            {
                _logger.LogWarning("Advance with ID: {AdvanceID} not found.", advanceId);
            }
            return advance;
        }

        public async Task<IEnumerable<AdvanceViewDto>> GetAdvancesByEmployeeAsync(int employeeId)
        {
            _logger.LogInformation("Fetching advances for EmployeeID: {EmployeeID}", employeeId);
            // Projection is done directly in the query.
            return await _context.Tbl_Advances
                .Where(a => a.EmployeeID == employeeId && !a.IsDeleted)
                .OrderByDescending(a => a.RequestDate)
                .Select(a => new AdvanceViewDto
                {
                    ID = a.ID,
                    EmployeeID = a.EmployeeID,
                    EmployeeName = $"{a.Employee.FirstName} {a.Employee.LastName}",
                    Amount = a.Amount,
                    RequestDate = a.RequestDate.ToString("dd-MMM-yyyy"),
                    Reason = a.Reason,
                    Status = a.Status,
                    StatusDate = a.StatusDate.HasValue ? a.StatusDate.Value.ToString("dd-MMM-yyyy") : null,
                    ProcessedByName = a.ProcessedByEmployee != null ? $"{a.ProcessedByEmployee.FirstName} {a.ProcessedByEmployee.LastName}" : "N/A"
                })
                .ToListAsync();
        }

        public async Task<AdvanceViewDto> UpdateAdvanceStatusAsync(int advanceId, AdvanceUpdateStatusDto dto)
        {
            _logger.LogInformation("Attempting to update status for advance ID: {AdvanceID} to {Status}", advanceId, dto.Status);
            var advance = await _context.Tbl_Advances.FirstOrDefaultAsync(a => a.ID == advanceId && !a.IsDeleted);
            if (advance == null)
            {
                _logger.LogWarning("Advance with ID: {AdvanceID} not found for status update.", advanceId);
                return null;
            }

            advance.Status = dto.Status;
            advance.StatusDate = DateTime.UtcNow;
            advance.ProcessedByEmployeeId = dto.ProcessedByEmployeeId;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Successfully updated status for advance ID: {AdvanceID}", advanceId);

            return await GetAdvanceByIdAsync(advanceId);
        }
    }
}