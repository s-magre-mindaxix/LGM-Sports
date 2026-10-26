using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.LeaveDetails;
using CompanyPlatform.Core.Models;
using PayrollManagementAPI.Services.LeaveManagement;


namespace PayrollManagementAPI.Services
{
    public class LeaveManagementService : ILeaveManagementService
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<LeaveManagementService> _logger;

        public LeaveManagementService(ApplicationDBContext context, ILogger<LeaveManagementService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<string> AccrueYearlyEarnLeavesFromPreviousYearAsync(int yearToCredit, int yearToScan)
        {
            _logger.LogInformation("Starting yearly Earn Leave accrual for year {YearToCredit}, based on cumulative attendance from {YearToScan}", yearToCredit, yearToScan);

            var earnLeaveType = await _context.Tb_LeaveTypes.FirstOrDefaultAsync(lt => lt.LeaveTypeName.ToLower() == "earn leave");
            if (earnLeaveType == null)
            {
                return "Error: 'Earn Leave' type not found in database.";
            }

            var activeEmployees = await _context.Employees.Where(e => e.IsActive && !e.IsDeleted).ToListAsync();

            // 1. Get a summary of all attendance for the scan year in one go for efficiency
            // We count Present as 1 and HalfDay as 1 (as per your previous logic)
            var attendanceSummary = await _context.Tbl_Attendance
                .Where(a => a.Date.Year == yearToScan && !a.IsDeleted)
                .GroupBy(a => a.EmployeeID)
                .Select(g => new
                {
                    EmployeeID = g.Key,
                    TotalWorkDays = g.Count(a => a.Status == AttendanceStatus.Present || a.Status == AttendanceStatus.HalfDay)
                })
                .ToDictionaryAsync(x => x.EmployeeID, x => x.TotalWorkDays);

            int totalCreditedCount = 0;
            int employeesProcessed = 0;

            foreach (var employee in activeEmployees)
            {
                string accrualNote = $"Yearly Accrual for {yearToCredit} based on {yearToScan} cumulative attendance";

                // Check if already processed
                bool alreadyCredited = await _context.Tb_LeaveCreditLedgers
                    .AnyAsync(l => l.EmployeeID == employee.ID && l.LeaveTypeID == earnLeaveType.ID && l.Notes == accrualNote);

                if (alreadyCredited) continue;

                // 2. Get total days from our dictionary
                if (attendanceSummary.TryGetValue(employee.ID, out int totalDaysWorked))
                {
                    // 3. Calculate Earn Leaves: Total Days / 20 
                    // Example: 240 days / 20 = 12 leaves. 
                    // Example: 30 days (10 Jan + 10 Feb + 10 Mar) / 20 = 1.5 -> (int) casts to 1
                    int earnedLeaves = totalDaysWorked / 20;

                    if (earnedLeaves > 0)
                    {
                        var credit = new LeaveCreditLedger
                        {
                            EmployeeID = employee.ID,
                            LeaveTypeID = earnLeaveType.ID,
                            Credit = earnedLeaves,
                            EarnedDate = new DateTime(yearToCredit, 1, 1),
                            ExpiryDate = new DateTime(yearToCredit, 12, 31),
                            Notes = accrualNote
                        };

                        await _context.Tb_LeaveCreditLedgers.AddAsync(credit);
                        totalCreditedCount += earnedLeaves;
                        employeesProcessed++;
                    }
                }
            }

            await _context.SaveChangesAsync();

            string result = $"Yearly Accrual complete. Total Work Days scanned. Credited {totalCreditedCount} leaves to {employeesProcessed} employees for the year {yearToCredit}.";
            _logger.LogInformation(result);
            return result;
        }

        // THIS IS THE NEW, REPLACEMENT METHOD
        public async Task<string> AllocateLeavesToAllEmployeesAsync(LeaveAllocationDto dto)
        {
            _logger.LogInformation(
                "Starting direct leave allocation for all employees. FinancialYear: {FinancialYear}, LeaveTypeID: {LeaveTypeID}, Days: {Days}",
                dto.FinancialYear, dto.LeaveTypeID, dto.AllocatedDays);

            // 1. Validate that the Leave Type exists
            var leaveTypeExists = await _context.Tb_LeaveTypes.AnyAsync(lt => lt.ID == dto.LeaveTypeID && !lt.IsDeleted);
            if (!leaveTypeExists)
            {
                _logger.LogWarning("Allocation failed. Leave Type with ID {LeaveTypeID} not found.", dto.LeaveTypeID);
                return $"Error: Leave Type with ID {dto.LeaveTypeID} not found.";
            }

            // 2. Get all active employees
            var activeEmployeeIds = await _context.Employees
                .Where(e => e.IsActive && !e.IsDeleted)
                .Select(e => e.ID)
                .ToListAsync();

            if (!activeEmployeeIds.Any())
            {
                _logger.LogWarning("No active employees found. Aborting leave allocation.");
                return "No active employees found to allocate leaves to.";
            }

            var newAllocations = new List<AssignLeaveType>();
            int skippedCount = 0;

            // 3. Loop through employees to create new allocation records
            foreach (var empId in activeEmployeeIds)
            {
                // Check if this employee already has this specific leave type allocated for the year
                bool alreadyExists = await _context.Tb_AssignLeaveTypes
                    .AnyAsync(a => a.EmployeeID == empId &&
                                   a.LeaveTypeID == dto.LeaveTypeID &&
                                   a.FinancialYear == dto.FinancialYear &&
                                   !a.IsDeleted);

                if (!alreadyExists)
                {
                    newAllocations.Add(new AssignLeaveType
                    {
                        EmployeeID = empId,
                        LeaveTypeID = dto.LeaveTypeID,
                        AllocatedDays = dto.AllocatedDays,
                        FinancialYear = dto.FinancialYear,
                        IsDeleted = false
                    });
                }
                else
                {
                    skippedCount++;
                }
            }

            // 4. Save any new allocations to the database
            if (newAllocations.Any())
            {
                _context.Tb_AssignLeaveTypes.AddRange(newAllocations);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully allocated leaves for {NewCount} employees. Skipped {SkippedCount} existing allocations.", newAllocations.Count, skippedCount);
                return $"Successfully allocated leaves for {newAllocations.Count} employees. Skipped {skippedCount} employees who already had this allocation.";
            }

            _logger.LogWarning("No new leave allocations were needed for FY {FinancialYear}. All {TotalCount} active employees already have this allocation.", dto.FinancialYear, activeEmployeeIds.Count);
            return $"No new leave assignments were created. All {activeEmployeeIds.Count} active employees already have this leave type allocated for the year {dto.FinancialYear}.";
        }

        public async Task<List<AssignedLeaveViewDto>> GetAllocatedLeavesForYearAsync(int financialYear)
        {
            _logger.LogInformation("Fetching allocated leaves for financial year: {FinancialYear}", financialYear);
            var allocations = await _context.Tb_AssignLeaveTypes
                .Where(a => a.FinancialYear == financialYear && !a.IsDeleted)
                .Include(a => a.Employee)
                .Include(a => a.LeaveType)
                .OrderBy(a => a.Employee.FirstName)
                .ThenBy(a => a.LeaveType.LeaveTypeName)
                .Select(a => new AssignedLeaveViewDto
                {
                    AssignLeaveTypeID = a.ID,
                    EmployeeID = a.EmployeeID,
                    EmployeeName = a.Employee.FirstName + " " + a.Employee.LastName,
                    LeaveTypeName = a.LeaveType.LeaveTypeName,
                    AllocatedDays = a.AllocatedDays,
                    FinancialYear = a.FinancialYear
                })
                .ToListAsync();

            _logger.LogInformation("Found {Count} leave allocations for financial year: {FinancialYear}", allocations.Count, financialYear);
            return allocations;
        }

        public async Task<string> UpdateAllocatedLeaveAsync(int assignLeaveTypeId, decimal newAllocatedDays)
        {
            _logger.LogInformation("Attempting to update leave allocation ID: {AssignLeaveTypeID}", assignLeaveTypeId);

            var allocationToUpdate = await _context.Tb_AssignLeaveTypes
                .FirstOrDefaultAsync(a => a.ID == assignLeaveTypeId && !a.IsDeleted);

            if (allocationToUpdate == null)
            {
                _logger.LogWarning("Update failed. Allocation with ID {AssignLeaveTypeID} not found.", assignLeaveTypeId);
                return $"Error: Allocation with ID {assignLeaveTypeId} not found.";
            }

            // Update the property
            allocationToUpdate.AllocatedDays = newAllocatedDays;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated allocated days for allocation ID {AssignLeaveTypeID}.", assignLeaveTypeId);

            return "Successfully updated the allocated leave days.";
        }

    }
}