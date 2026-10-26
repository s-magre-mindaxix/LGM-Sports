using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.HRMS;
using Microsoft.EntityFrameworkCore;


namespace PayrollManagementAPI.Services.LeaveEncashment
{
    public class LeaveEncashmentService : ILeaveEncashmentService
    {
        private readonly ApplicationDBContext _context;

        public LeaveEncashmentService(ApplicationDBContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LeaveEncashmentViewModel>> GetLeaveEncashmentsAsync(int financialYear)
        {
            return await _context.Tbl_LeaveEncashments
                .Include(le => le.Employee)
                .ThenInclude(e => e.Designation)
                .Where(le => le.FinancialYear == financialYear)
                .Select(le => new LeaveEncashmentViewModel
                {
                    EmployeeName = le.Employee.FirstName + " " + le.Employee.LastName,
                    Designation = le.Employee.Designation.DesignationName,
                    GrossSalary = le.GrossSalary,
                    RateOfELEncashment = le.RateOfELEncashment,
                    TotalEarnedLeaves = le.TotalEarnedLeaves,
                    LeavesTaken = le.LeavesTaken,
                    RemainingLeavesForEncashment = le.RemainingLeavesForEncashment,
                    TotalAmountOfELEncashment = le.TotalAmountOfELEncashment,
                    DateOfPayment = le.DateOfPayment,
                    Status = le.Status
                })
                .ToListAsync();
        }


        public async Task<CompanyPlatform.Core.Models.HRMS.LeaveEncashment> ProcessLeaveEncashmentForEmployeeAsync(int employeeId, int financialYear)
        {
            var employee = await _context.Employees
                                        .Include(e => e.Designation)
                                        .FirstOrDefaultAsync(e => e.ID == employeeId);

            if (employee == null)
            {
                throw new Exception("Employee not found");
            }

            var assignedEarnedLeave = await _context.Tb_AssignLeaveTypes
                .FirstOrDefaultAsync(alt => alt.EmployeeID == employeeId &&
                                            alt.LeaveType.LeaveTypeName == "Earned Leave" &&
                                            alt.FinancialYear == financialYear);

            if (assignedEarnedLeave == null)
            {
                // No earned leave allocated for this employee in the financial year
                return null;
            }

            var leavesTaken = await _context.Tb_LeaveRequests
                .Where(lr => lr.EmployeeID == employeeId &&
                             lr.LeaveType.LeaveTypeName == "Earned Leave" &&
                             lr.FromDate.Year == financialYear &&
                             lr.Status == "Approved")
                .SumAsync(lr => lr.Days);

            var salarySummary = await _context.Tb_EmployeeSalarySummaries
                .Where(ess => ess.EmployeeID == employeeId)
                .OrderByDescending(ess => ess.EffectiveDate)
                .FirstOrDefaultAsync();

            if (salarySummary == null)
            {
                throw new Exception("Salary summary not found for the employee");
            }

            var grossSalary = salarySummary.MonthlyGrossSalary;
            var rateOfELEncashment = grossSalary / 26; // Assuming 26 working days in a month
            var remainingLeaves = (int)assignedEarnedLeave.AllocatedDays - (int)leavesTaken;
            var totalAmount = rateOfELEncashment * remainingLeaves;

            var leaveEncashment = new CompanyPlatform.Core.Models.HRMS.LeaveEncashment
            {
                EmployeeID = employeeId,
                FinancialYear = financialYear,
                GrossSalary = grossSalary,
                RateOfELEncashment = rateOfELEncashment,
                TotalEarnedLeaves = (int)assignedEarnedLeave.AllocatedDays,
                LeavesTaken = (int)leavesTaken,
                RemainingLeavesForEncashment = remainingLeaves,
                TotalAmountOfELEncashment = totalAmount,
                DateOfPayment = new DateTime(financialYear, 12, 31), // End of year payment
                Status = "Paid"
            };

            _context.Tbl_LeaveEncashments.Add(leaveEncashment);
            await _context.SaveChangesAsync();

            return leaveEncashment;
        }

        public async Task<object> ProcessLeaveEncashmentForYearAsync(int financialYear)
        {
            // Get all active employees who haven't been processed for this year yet
            var existingProcessedEmployeeIds = await _context.Tbl_LeaveEncashments
                .Where(le => le.FinancialYear == financialYear)
                .Select(le => le.EmployeeID)
                .ToListAsync();

            var employeesToProcess = await _context.Employees
                .Where(e => e.IsActive && !existingProcessedEmployeeIds.Contains(e.ID)&&
                 _context.Tb_SalaryStructures.Any(ss => ss.EmployeeID == e.ID && ss.IsDeleted==false))
                .ToListAsync();

            if (!employeesToProcess.Any())
            {
                throw new Exception("All employees have already been processed for this year, or no eligible employees found.");
            }

            var newEncashmentRecords = new List<CompanyPlatform.Core.Models.HRMS.LeaveEncashment>();
            int processedCount = 0;

            foreach (var employee in employeesToProcess)
            {
                // Re-use your existing calculation logic, but don't save yet
                var assignedEarnedLeave = await _context.Tb_AssignLeaveTypes
                    .Include(alt => alt.LeaveType)
                    .FirstOrDefaultAsync(alt => alt.EmployeeID == employee.ID &&
                                                alt.LeaveType.LeaveTypeName == "Earned Leave" &&
                                                alt.FinancialYear == financialYear);

                // Skip if no earned leave is assigned
                if (assignedEarnedLeave == null) continue;

                var leavesTaken = await _context.Tb_LeaveRequests
                    .Where(lr => lr.EmployeeID == employee.ID &&
                                 lr.LeaveType.LeaveTypeName == "Earned Leave" &&
                                 lr.FromDate.Year == financialYear &&
                                 lr.Status == "Approved")
                    .SumAsync(lr => lr.Days);

                var salarySummary = await _context.Tb_EmployeeSalarySummaries
                    .Where(ess => ess.EmployeeID == employee.ID)
                    .OrderByDescending(ess => ess.EffectiveDate)
                    .FirstOrDefaultAsync();

                // Skip if no salary found
                if (salarySummary == null) continue;

                var grossSalary = salarySummary.MonthlyGrossSalary;
                var rateOfELEncashment = grossSalary / 31; // Assuming 26 working days
                var remainingLeaves = (int)assignedEarnedLeave.AllocatedDays - (int)leavesTaken;

                // Only create record if there are leaves to encash
                if (remainingLeaves <= 0) continue;

                var totalAmount = Math.Ceiling(rateOfELEncashment * remainingLeaves);

                var leaveEncashment = new CompanyPlatform.Core.Models.HRMS.LeaveEncashment
                {
                    EmployeeID = employee.ID,
                    FinancialYear = financialYear,
                    GrossSalary = grossSalary,
                    RateOfELEncashment = rateOfELEncashment,
                    TotalEarnedLeaves = (int)assignedEarnedLeave.AllocatedDays,
                    LeavesTaken = (int)leavesTaken,
                    RemainingLeavesForEncashment = remainingLeaves,
                    TotalAmountOfELEncashment = totalAmount,
                    DateOfPayment = new DateTime(financialYear, 12, 31),
                    Status = "Paid"
                };

                newEncashmentRecords.Add(leaveEncashment);
                processedCount++;
            }

            if (newEncashmentRecords.Any())
            {
                await _context.Tbl_LeaveEncashments.AddRangeAsync(newEncashmentRecords);
                await _context.SaveChangesAsync();
            }

            return new { message = $"Successfully processed leave encashment for {processedCount} employee(s)." };
        }

        public async Task<LeaveEncashmentViewModel> GetMyLeaveEncashmentAsync(int employeeId, int financialYear)
        {
            var leaveEncashment = await _context.Tbl_LeaveEncashments
                .Include(le => le.Employee)
                .ThenInclude(e => e.Designation)
                .Where(le => le.FinancialYear == financialYear && le.EmployeeID == employeeId)
                .Select(le => new LeaveEncashmentViewModel
                {
                    EmployeeName = le.Employee.FirstName + " " + le.Employee.LastName,
                    Designation = le.Employee.Designation.DesignationName,
                    GrossSalary = le.GrossSalary,
                    RateOfELEncashment = le.RateOfELEncashment,
                    TotalEarnedLeaves = le.TotalEarnedLeaves,
                    LeavesTaken = le.LeavesTaken,
                    RemainingLeavesForEncashment = le.RemainingLeavesForEncashment,
                    TotalAmountOfELEncashment = le.TotalAmountOfELEncashment,
                    DateOfPayment = le.DateOfPayment,
                    Status = le.Status
                })
                .FirstOrDefaultAsync();

            return leaveEncashment;
        }
    }

    public class LeaveEncashmentViewModel
    {
        public string EmployeeName { get; set; }
        public string Designation { get; set; }
        public decimal GrossSalary { get; set; }
        public decimal RateOfELEncashment { get; set; }
        public int TotalEarnedLeaves { get; set; }
        public int LeavesTaken { get; set; }
        public int RemainingLeavesForEncashment { get; set; }
        public decimal TotalAmountOfELEncashment { get; set; }
        public DateTime DateOfPayment { get; set; }
        public string Status { get; set; }
    }
}
