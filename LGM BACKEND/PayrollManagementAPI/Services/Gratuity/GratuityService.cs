using CompanyPlatform.Core.Data;
using Microsoft.EntityFrameworkCore;

namespace PayrollManagementAPI.Services.Gratuity
{
    public class GratuityService : IGratuityService
    {
        private readonly ApplicationDBContext _context;

        public GratuityService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<CompanyPlatform.Core.Models.HRMS.Gratuity> CalculateGratuityForEmployee(int employeeId)
        {
            var employee = await _context.Employees
                .Include(e => e.SalaryStructures)
                .ThenInclude(ss => ss.SalaryComponent)
                .FirstOrDefaultAsync(e => e.ID == employeeId);

            if (employee == null || employee.DateOfJoining == null)
            {
                return null;
            }

            DateTime endDate = employee.DateOfLeaving ?? DateTime.Now;

            double totalDays = (endDate - employee.DateOfJoining.Value).TotalDays;
            decimal exactYearsOfService = (decimal)(totalDays / 365.25);

            // Basic Salary Logic
            decimal lastDrawnBasicSalary = 0;
            var basicSalaryComponent = employee.SalaryStructures
                .FirstOrDefault(ss => ss.SalaryComponent.ComponentName.Equals("Basic Salary", StringComparison.OrdinalIgnoreCase));

            if (basicSalaryComponent != null)
            {
                lastDrawnBasicSalary = basicSalaryComponent.Amount;
            }


            decimal gratuityAmount = 0;
            string status = "Not-Eligible";

            if (exactYearsOfService >= 1)
            {
                gratuityAmount = (lastDrawnBasicSalary * 15 * exactYearsOfService) / 26;
                gratuityAmount = Math.Round(gratuityAmount, 2);
                status = "Eligible";
            }

            return new CompanyPlatform.Core.Models.HRMS.Gratuity
            {
                EmployeeID = employee.ID,
                YearsOfService = Math.Round(exactYearsOfService, 2),
                LastDrawnBasicSalary = lastDrawnBasicSalary,
                GratuityAmount = gratuityAmount,
                CalculationDate = DateTime.UtcNow,
                Status = status
            };
        }

        public async Task ProcessGratuityForAllEligibleEmployees()
        {
            var employees = await _context.Employees
                .Where(e => !e.IsDeleted && e.DateOfJoining != null)
                .ToListAsync();

            foreach (var employee in employees)
            {
                var calculatedGratuity = await CalculateGratuityForEmployee(employee.ID);
                if (calculatedGratuity == null) continue;

                var existingGratuity = await _context.Tbl_Gratuitys
                    .FirstOrDefaultAsync(g => g.EmployeeID == employee.ID);

                if (existingGratuity != null)
                {
                    existingGratuity.YearsOfService = calculatedGratuity.YearsOfService;
                    existingGratuity.LastDrawnBasicSalary = calculatedGratuity.LastDrawnBasicSalary;
                    existingGratuity.GratuityAmount = calculatedGratuity.GratuityAmount;
                    existingGratuity.CalculationDate = calculatedGratuity.CalculationDate;
                    existingGratuity.Status = calculatedGratuity.Status;
                }
                else
                {
                    _context.Tbl_Gratuitys.Add(calculatedGratuity);
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<GratuityResponse> GetGratuityDashboardData(string userEmail, bool isAdmin)
        {
            var response = new GratuityResponse
            {
                AllRecords = new List<GratuityDto>(),
                MyRecord = null
            };

            var query = _context.Tbl_Gratuitys
                .Include(g => g.Employee)
                .ThenInclude(e => e.Designation)
                .Where(g => !g.IsDeleted); // Remove e.IsActive check so we see ex-employees

            List<CompanyPlatform.Core.Models.HRMS.Gratuity> rawRecords;

            if (isAdmin)
            {
                rawRecords = await query.ToListAsync();
            }
            else
            {
                rawRecords = await query.Where(g => g.Employee.EmailAddress == userEmail).ToListAsync();
            }

            var mappedRecords = rawRecords.Select(g => new GratuityDto
            {
                EmployeeName = $"{g.Employee.FirstName} {g.Employee.LastName}",
                EmployeeCode = g.Employee.EmployeeCode,
                Designation = g.Employee.Designation?.DesignationName ?? "N/A",
                YearsOfService = g.YearsOfService,
                LastDrawnBasicSalary = g.LastDrawnBasicSalary,
                GratuityAmount = g.GratuityAmount,
                CalculationDate = g.CalculationDate,
                Status = g.Status,
                // Map HR context fields
                DateOfJoining = g.Employee.DateOfJoining.Value, // Safe because we filtered nulls in Process
                DateOfLeaving = g.Employee.DateOfLeaving,
                IsActive = g.Employee.IsActive,
                EmailAddress = g.Employee.EmailAddress

            }).OrderByDescending(r => r.IsActive).ThenBy(r => r.EmployeeName).ToList();

            if (isAdmin) response.AllRecords = mappedRecords;

            response.MyRecord = mappedRecords
           .FirstOrDefault(r => string.Equals(r.EmailAddress, userEmail, StringComparison.OrdinalIgnoreCase));

            return response;
        }

        public async Task UpdateGratuityForSingleEmployee(int employeeId)
        {
            // 1. Calculate using the existing logic (which already handles DateOfLeaving vs Now)
            var calculatedGratuity = await CalculateGratuityForEmployee(employeeId);

            // 2. If null (e.g. no DOJ), ensure we don't crash, just return
            if (calculatedGratuity == null) return;

            // 3. Check if a record already exists
            var existingGratuity = await _context.Tbl_Gratuitys
                .FirstOrDefaultAsync(g => g.EmployeeID == employeeId);

            // 4. Update or Insert
            if (existingGratuity != null)
            {
                existingGratuity.YearsOfService = calculatedGratuity.YearsOfService;
                existingGratuity.LastDrawnBasicSalary = calculatedGratuity.LastDrawnBasicSalary;
                existingGratuity.GratuityAmount = calculatedGratuity.GratuityAmount;
                existingGratuity.CalculationDate = DateTime.UtcNow; // Update timestamp
                existingGratuity.Status = calculatedGratuity.Status;
            }
            else
            {
                _context.Tbl_Gratuitys.Add(calculatedGratuity);
            }

            await _context.SaveChangesAsync();
        }
    }

    public class GratuityDto
    {
        public string EmployeeName { get; set; }
        public string EmployeeCode { get; set; }
        public string Designation { get; set; }
        public decimal YearsOfService { get; set; }
        public decimal LastDrawnBasicSalary { get; set; }
        public decimal GratuityAmount { get; set; }
        public DateTime CalculationDate { get; set; }
        public string Status { get; set; } // "Eligible", "Not-Eligible"

        // New fields for HR context
        public DateTime DateOfJoining { get; set; }
        public DateTime? DateOfLeaving { get; set; }
        public bool IsActive { get; set; }

        public string EmailAddress { get; set; }
    }

    public class GratuityResponse
    {
        public List<GratuityDto> AllRecords { get; set; }
        public GratuityDto MyRecord { get; set; }
    }
}
