using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.TaxAndCompliance;

namespace PayrollManagementAPI.Services.TaxAndCompliance
{
    public class TaxAndComplianceService: ITaxAndComplianceService
    {
        private readonly ApplicationDBContext _context;

        public TaxAndComplianceService(ApplicationDBContext context)
        {
            _context = context;
        }
        public async Task<ComplianceDashboardStatsDto> GetDashboardStatsAsync(int year, int month)
        {
            // Find the ID of the latest completed payroll run for the period
            var latestCompletedRun = await _context.Tb_PayrollRuns
                .Where(pr => pr.Year == year && pr.Month == month && pr.Status == "Completed")
                .OrderByDescending(pr => pr.ProcessedDate)
                .FirstOrDefaultAsync();

            var monthlyComponentDetails = await _context.Tb_MonthlySalaryComponentDetails
                .Include(d => d.MonthlySalaryRecord.PayrollRun)
                .Where(d => d.MonthlySalaryRecord.PayrollRun.Year == year &&
                            d.MonthlySalaryRecord.PayrollRun.Month == month &&
                            d.ComponentType == "Deduction")
                .ToListAsync();

            // Calculate pending returns from the compliance table
            var pendingReturns = await _context.Tb_ComplianceFilingStatuses
                .CountAsync(s => s.Year == year && s.Month == month && !s.IsDeleted && s.Status != CompanyPlatform.Core.Models.FilingStatus.Filed);

            return new ComplianceDashboardStatsDto
            {
                TotalPfContribution = monthlyComponentDetails.Where(d => d.ComponentName == "P. F.").Sum(d => d.Amount),
                TotalEsicContribution = monthlyComponentDetails.Where(d => d.ComponentName == "ESIC").Sum(d => d.Amount),
                TotalTdsDeducted = monthlyComponentDetails.Where(d => d.ComponentName == "TDS").Sum(d => d.Amount),
                PendingReturns = pendingReturns,
                LatestCompletedRunId = latestCompletedRun?.Id
            };
        }

        public async Task<IEnumerable<StatutoryRecordDto>> GetStatutoryRecordsAsync(int year, int month)
        {
            var monthlyRecords = await _context.Tb_MonthlySalaryRecords
                .Include(r => r.Employee)
                .Include(r => r.PayrollRun)
                .Include(r => r.ComponentDetails)
                .Where(r => r.PayrollRun.Year == year && r.PayrollRun.Month == month)
                .ToListAsync();

            return monthlyRecords.Select(record =>
            {
                decimal GetComponentAmount(string name) => record.ComponentDetails.FirstOrDefault(c => c.ComponentName == name)?.Amount ?? 0;

                return new StatutoryRecordDto
                {
                    EmployeeId = record.Employee.EmployeeCode,
                    EmployeeName = $"{record.Employee.FirstName} {record.Employee.LastName}",
                    PfWages = GetComponentAmount("Basic Salary"),
                    EsicWages = record.GrossEarnings,
                    PfContribution = GetComponentAmount("P. F."),
                    EsicContribution = GetComponentAmount("ESIC"),
                    Tds = GetComponentAmount("TDS"),
                    Pt = GetComponentAmount("P. T."),
                };
            }).ToList();
        }

        public async Task<IEnumerable<ComplianceStatusDto>> GetComplianceStatusAsync(int year, int month)
        {
            var statuses = await _context.Tb_ComplianceFilingStatuses
                .Where(s => s.Year == year && s.Month == month && !s.IsDeleted)
                .OrderBy(s => s.ComplianceType)
                .ToListAsync();

            return statuses.Select(s => new ComplianceStatusDto
            {
                Id = s.Id,
                Label = s.ComplianceType,
                Status = s.Status.ToString(),
                DueDateInfo = s.DueDate.HasValue
                    ? $"Due {s.DueDate.Value:dd MMM}"
                    : null
            }).ToList();
        }

        public async Task<bool> UpdateComplianceItemAsync(UpdateComplianceStatusDto dto)
        {
            var complianceItem = await _context.Tb_ComplianceFilingStatuses.FindAsync(dto.Id);

            if (complianceItem == null || complianceItem.IsDeleted)
            {
                return false; 
            }

            complianceItem.Status = CompanyPlatform.Core.Models.FilingStatus.Filed; 
            complianceItem.FiledDate = dto.FiledDate;
            complianceItem.TransactionId = dto.TransactionId;
            complianceItem.Notes = dto.Notes;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ComplianceItemDetailsDto> GetComplianceItemDetailsAsync(int id)
        {
            var item = await _context.Tb_ComplianceFilingStatuses
                .Where(s => s.Id == id && !s.IsDeleted)
                .Select(s => new ComplianceItemDetailsDto
                {
                    ComplianceType = s.ComplianceType,
                    FiledDate = s.FiledDate,
                    TransactionId = s.TransactionId,
                    Notes = s.Notes
                })
                .FirstOrDefaultAsync();

            return item; // Will be null if not found
        }
    }
}
