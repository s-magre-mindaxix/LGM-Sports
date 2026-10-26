using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.HRMS;
using Microsoft.EntityFrameworkCore;
using PayrollManagementAPI.DTO;
using PayrollManagementAPI.Helpers;
using PayrollManagementAPI.Services.Gratuity;

namespace PayrollManagementAPI.Services.FullandFinal
{
    public class FnFService : IFnFService
    {
        private readonly ApplicationDBContext _context;
        private readonly IGratuityService _gratuityService;

        public FnFService(ApplicationDBContext context, IGratuityService gratuityService)
        {
            _context = context;
            _gratuityService = gratuityService;
        }

        //public async Task<FnFPreviewResponse> CalculatePreview(FnFPreviewRequest req)
        //{
        //    var emp = await _context.Employees
        //        .Include(e => e.SalaryStructures).ThenInclude(s => s.SalaryComponent)
        //        .Include(e => e.Designation)
        //        .FirstOrDefaultAsync(e => e.ID == req.EmployeeId);

        //    if (emp == null) throw new Exception("Employee not found");

        //    decimal gross = emp.SalaryStructures
        //        .Where(s => !s.IsDeleted && s.SalaryComponent.ComponentType == "Earning")
        //        .Sum(s => s.Amount);

        //    // ---------- A. Salary Calculation (UPDATED) ----------
        //    int daysInMonth = DateTime.DaysInMonth(req.LastWorkingDay.Year, req.LastWorkingDay.Month);

        //    // Use the Day of the Last Working Day (e.g., 17) as the max payable days
        //    int paidDays = req.LastWorkingDay.Day - req.LopDays - req.UnpaidLeaveDays;
        //    if (paidDays < 0) paidDays = 0;

        //    decimal perDay = daysInMonth > 0 ? gross / daysInMonth : 0;

        //    // Round to 0 decimals to match Excel
        //    decimal salaryPayable = Math.Round(perDay * paidDays, 0);

        //    // ---------- B. Leave Encashment ----------
        //    int fy = req.LastWorkingDay.Month >= 4 ? req.LastWorkingDay.Year : req.LastWorkingDay.Year - 1;

        //    var assignedEL = await _context.Tb_AssignLeaveTypes
        //        .FirstOrDefaultAsync(x => x.EmployeeID == emp.ID && x.LeaveType.LeaveTypeName == "Earned Leave");

        //    var takenEL = await _context.Tb_LeaveRequests
        //        .Where(x => x.EmployeeID == emp.ID &&
        //                    x.LeaveType.LeaveTypeName == "Earned Leave" &&
        //                    x.Status == "Approved" &&
        //                    x.FromDate <= req.LastWorkingDay)
        //        .SumAsync(x => x.Days);

        //    int balanceEL = Math.Max(0, (int)((assignedEL?.AllocatedDays ?? 0) - takenEL));
        //    decimal leaveRate = gross / 26; // Standard Factory Act Rule
        //    decimal leaveAmount = Math.Round(balanceEL * leaveRate, 0); // Rounded to 0

        //    // ---------- C. Bonus ----------
        //    DateTime fyStart = new DateTime(fy, 4, 1);
        //    int tenureDays = (int)(req.LastWorkingDay - fyStart).TotalDays + 1;

        //    decimal bonus = 0;
        //    if (tenureDays > 30)
        //    {
        //        decimal earnedGross = (gross * 12 / 365) * tenureDays;
        //        bonus = Math.Round(earnedGross * 0.0833m, 0); // Rounded to 0
        //    }

        //    // ---------- D. Gratuity ----------
        //    double serviceDays = (req.LastWorkingDay - emp.DateOfJoining.Value).TotalDays;
        //    // 4 Years 240 Days Rule
        //    int completedYears = serviceDays >= (4 * 365 + 240)
        //        ? (int)Math.Ceiling(serviceDays / 365)
        //        : (int)Math.Floor(serviceDays / 365);

        //    decimal basic = emp.SalaryStructures
        //        .FirstOrDefault(s => s.SalaryComponent.ComponentName.Contains("Basic"))?.Amount ?? 0;

        //    decimal gratuity = completedYears >= 5
        //        ? Math.Round((basic * 15 * completedYears) / 26, 0) // Rounded to 0
        //        : 0;

        //    // ---------- E. Notice ----------
        //    decimal noticeAmount = req.NoticeShortfallDays > 0
        //        ? Math.Round((gross / 30) * req.NoticeShortfallDays * -1, 0) // Rounded to 0
        //        : 0;

        //    decimal net =
        //        salaryPayable +
        //        leaveAmount +
        //        bonus +
        //        gratuity +
        //        noticeAmount;

        //    return new FnFPreviewResponse
        //    {
        //        EmployeeId = emp.ID,
        //        EmployeeName = $"{emp.FirstName} {emp.LastName}",
        //        Designation = emp.Designation?.DesignationName,
        //        DateOfJoining = emp.DateOfJoining.Value,
        //        LastWorkingDay = req.LastWorkingDay,

        //        Salary = new SalaryComponentDTO
        //        {
        //            ExitMonth = req.LastWorkingDay.ToString("MMMM yyyy"),
        //            TotalDays = daysInMonth,
        //            PaidDays = paidDays,
        //            MonthlyGross = gross,
        //            PayableAmount = salaryPayable
        //        },

        //        Leave = new LeaveComponentDto
        //        {
        //            BalanceDays = balanceEL,
        //            RatePerDay = Math.Round(leaveRate, 2), // Keep rate precise
        //            Amount = leaveAmount
        //        },

        //        Bonus = new BonusComponentDto
        //        {
        //            Description = $"Pro-rata Bonus FY {fy}-{fy + 1}",
        //            Amount = bonus
        //        },

        //        GratuityAmount = gratuity,
        //        NoticePeriodAmount = noticeAmount,
        //        NetPayable = net
        //    };
        //}

        public async Task<FnFPreviewResponse> CalculatePreview(FnFPreviewRequest req)
        {
            var emp = await _context.Employees
                .Include(e => e.SalaryStructures).ThenInclude(s => s.SalaryComponent)
                .Include(e => e.Designation)
                .Include(e => e.WorkLocation)
                .FirstOrDefaultAsync(e => e.ID == req.EmployeeId);

            if (emp == null) throw new Exception("Employee not found");

            // FIX CS8629: Handle Null DateOfJoining safely
            DateTime dateOfJoining = emp.DateOfJoining ?? req.LastWorkingDay;

            // Fetch Settings
            var statutorySettings = await _context.Tb_StatutorySettings
                .Where(s => s.IsActive && !s.IsDeleted)
                .ToDictionaryAsync(s => s.SettingName, s => s.SettingValue);

            var allProfessionalTaxSlabs = await _context.Tb_ProfessionalTaxSlabs
                .Where(s => !s.IsDeleted)
                .ToListAsync();

            // =========================================================
            // A. SALARY CALCULATION
            // =========================================================
            int daysInMonth = DateTime.DaysInMonth(req.LastWorkingDay.Year, req.LastWorkingDay.Month);
            int potentialDays = req.LastWorkingDay.Day;
            decimal payableDays = potentialDays - req.LopDays - req.UnpaidLeaveDays;
            if (payableDays < 0) payableDays = 0;

            var earningBreakdown = new List<ComponentBreakdownDto>();
            var deductionBreakdown = new List<ComponentBreakdownDto>();

            decimal earnedBasic = 0;
            decimal earnedGross = 0;

            var earningComponents = emp.SalaryStructures
                .Where(ss => !ss.IsDeleted && ss.Status == "Active" && ss.SalaryComponent.ComponentType == "Earning")
                .ToList();

            foreach (var component in earningComponents)
            {
                // Avoid DivideByZero
                decimal proratedAmount = daysInMonth > 0 ? (component.Amount / daysInMonth) * payableDays : 0;
                proratedAmount = Math.Round(proratedAmount, 0, MidpointRounding.AwayFromZero);

                earnedGross += proratedAmount;

                earningBreakdown.Add(new ComponentBreakdownDto
                {
                    Name = component.SalaryComponent.ComponentName,
                    Amount = proratedAmount,
                    OriginalAmount = component.Amount
                });

                if (component.SalaryComponent.ComponentName.Trim().Equals("Basic Salary", StringComparison.OrdinalIgnoreCase))
                {
                    earnedBasic = proratedAmount;
                }
            }

            // --- Deductions ---
            decimal totalDeductions = 0;

            //var pfDetails = await _context.EmployeePFDetails
            //     .FirstOrDefaultAsync(p => p.EmployeeID == emp.ID && !p.IsDeleted);

            //// 1. PF
            //var (employeePF, employerPF) = PayrollCalculationHelper.CalculateProvidentFund(
            //    earnedGross,
            //    earnedBasic,
            //    statutorySettings,
            //    pfDetails?.PFDeductionPercentage,
            //    pfDetails?.IsCappedAt15k ?? false
            //);

            //if (employeePF > 0)
            //{
            //    decimal pfAmt = Math.Ceiling(employeePF);
            //    totalDeductions += pfAmt;
            //    deductionBreakdown.Add(new ComponentBreakdownDto { Name = "Provident Fund", Amount = pfAmt });
            //}

            // 2. PT (Fix for CS0103)
            // FIX CS8601: Handle null WorkLocation or State
            var employeeState = emp.WorkLocation?.State ?? "DefaultState";
            var stateSpecificSlabs = allProfessionalTaxSlabs
                          .Where(s => s.State.Trim().Equals("Maharashtra", StringComparison.OrdinalIgnoreCase))
                          .ToList();

            // Define variable specifically here so it exists in context
            decimal professionalTax = PayrollCalculationHelper.CalculateProfessionalTax(
                earnedGross,
                emp.Gender ?? "Male", // Handle null gender
                stateSpecificSlabs,
                req.LastWorkingDay.Month
            );

            if (professionalTax > 0)
            {
                decimal ptAmt = Math.Ceiling(professionalTax);
                totalDeductions += ptAmt;
                deductionBreakdown.Add(new ComponentBreakdownDto { Name = "Professional Tax", Amount = ptAmt });
            }

            // 3. ESIC 
            // Define variable specifically here
            //decimal esic = PayrollCalculationHelper.CalculateESIC(earnedGross, statutorySettings);

            //if (esic > 0)
            //{
            //    decimal esicAmt = Math.Ceiling(esic);
            //    totalDeductions += esicAmt;
            //    deductionBreakdown.Add(new ComponentBreakdownDto { Name = "ESIC", Amount = esicAmt });
            //}

            // 4. LWF
            //if (req.LastWorkingDay.Month == 6 || req.LastWorkingDay.Month == 12)
            //{
            //    totalDeductions += 25.00m;
            //    deductionBreakdown.Add(new ComponentBreakdownDto { Name = "LWF", Amount = 25.00m });
            //}

            decimal salaryPayable = earnedGross - totalDeductions;
            if (salaryPayable < 0) salaryPayable = 0;

            // =========================================================
            // B. Leave Encashment
            // =========================================================
            int fy = req.LastWorkingDay.Month >= 4 ? req.LastWorkingDay.Year : req.LastWorkingDay.Year - 1;

            var assignedEL = await _context.Tb_AssignLeaveTypes
                .FirstOrDefaultAsync(x => x.EmployeeID == emp.ID && x.LeaveType.LeaveTypeName == "Casual Leave");

            var takenEL = await _context.Tb_LeaveRequests
                .Where(x => x.EmployeeID == emp.ID &&
                            x.LeaveType.LeaveTypeName == "Casual Leave" &&
                            x.Status == "Approved" &&
                            x.FromDate <= req.LastWorkingDay)
                .SumAsync(x => x.Days);

            int balanceEL = Math.Max(0, (int)((assignedEL?.AllocatedDays ?? 0) - takenEL));
            decimal monthlyStructureGross = earningComponents.Sum(x => x.Amount);
            decimal leaveRate = monthlyStructureGross / daysInMonth;
            decimal leaveAmount = Math.Round(balanceEL * leaveRate, 0);

            // =========================================================
            // C. Bonus
            // =========================================================
            DateTime fyStart = new DateTime(fy, 4, 1);
            int tenureDays = (int)(req.LastWorkingDay - fyStart).TotalDays + 1;
            decimal bonus = 0;
            if (tenureDays > 30)
            {
                decimal estimatedEarnedGross = (monthlyStructureGross * 12 / 365) * tenureDays;
                bonus = Math.Round(estimatedEarnedGross * 0.0833m, 0);
            }

            // =========================================================
            // D. Gratuity
            // =========================================================
            decimal structureBasic = earningComponents
              .FirstOrDefault(s => s.SalaryComponent.ComponentName.Trim().Equals("Basic Salary", StringComparison.OrdinalIgnoreCase))
              ?.Amount ?? 0;

            double totalServiceDays = (req.LastWorkingDay - dateOfJoining).TotalDays;

            decimal exactYears = (decimal)(totalServiceDays / 365.25);

            decimal tenureForCalculation = Math.Round(exactYears, 2);

            decimal gratuity = 0;

            if (exactYears >= 4.66m)
            {
                gratuity = (structureBasic * 15 * tenureForCalculation) / 26;
                gratuity = Math.Round(gratuity, 0);
            }

            // =========================================================
            // E. Notice
            // =========================================================
            decimal noticeAmount = req.NoticeShortfallDays > 0
                ? Math.Round((monthlyStructureGross / 30) * req.NoticeShortfallDays * -1, 0)
                : 0;

            // =========================================================
            // FINAL RETURN
            // =========================================================
            return new FnFPreviewResponse
            {
                EmployeeId = emp.ID,
                EmployeeName = $"{emp.FirstName} {emp.LastName}",
                Designation = emp.Designation?.DesignationName ?? "N/A", // Fix null ref
                DateOfJoining = dateOfJoining,
                LastWorkingDay = req.LastWorkingDay,

                Salary = new SalaryComponentDTO
                {
                    ExitMonth = req.LastWorkingDay.ToString("MMMM yyyy"),
                    TotalDays = daysInMonth,
                    PaidDays = payableDays,

                    // Fix: These properties now exist in SalaryComponentDto
                    EarnedGross = earnedGross,
                    TotalDeductions = totalDeductions,
                    MonthlyGross = monthlyStructureGross,
                    PayableAmount = salaryPayable,

                    EarningBreakdown = earningBreakdown,
                    DeductionBreakdown = deductionBreakdown
                },

                Leave = new LeaveComponentDto
                {
                    BalanceDays = balanceEL,
                    RatePerDay = Math.Round(leaveRate, 2),
                    Amount = leaveAmount
                },

                Bonus = new BonusComponentDto
                {
                    Description = $"Pro-rata Bonus FY {fy}-{fy + 1}",
                    Amount = bonus
                },

                GratuityAmount = gratuity,
                NoticePeriodAmount = noticeAmount,
                NetPayable = salaryPayable + leaveAmount + bonus + gratuity + noticeAmount
            };
        }


        // ================= FINALIZE =================
        public async Task<FnFSettlement> Finalize(FnFSettlement settlement)
        {
            bool alreadyExists = await _context.Tbl_FnFSettlements
                .AnyAsync(f => f.EmployeeID == settlement.EmployeeID && f.Status == "Approved" && !f.IsDeleted);

            if (alreadyExists)
            {
                throw new InvalidOperationException("Full and Final Settlement is already finalized for this employee.");
            }

            // Set these values explicitly
            settlement.Status = "Approved";
            settlement.SettlementDate = DateTime.UtcNow;

            // Add to DB
            _context.Tbl_FnFSettlements.Add(settlement);

            // Deactivate Employee
            var emp = await _context.Employees.FindAsync(settlement.EmployeeID);
            if (emp != null)
            {
                emp.IsActive = false;
                emp.DateOfLeaving = settlement.LastWorkingDay;
            }

            // Freeze Gratuity
            await _gratuityService.UpdateGratuityForSingleEmployee(settlement.EmployeeID);

            await _context.SaveChangesAsync();
            return settlement;
        }
    }

    public class FnFPreviewRequest
    {
        public int EmployeeId { get; set; }
        public DateTime LastWorkingDay { get; set; }

        // Optional overrides from UI
        public int LopDays { get; set; }
        public int UnpaidLeaveDays { get; set; }
        public int NoticeShortfallDays { get; set; }
    }
    public class FnFPreviewResponse
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string Designation { get; set; }
        public DateTime DateOfJoining { get; set; }
        public DateTime LastWorkingDay { get; set; }

        public SalaryComponentDTO Salary { get; set; }
        public LeaveComponentDto Leave { get; set; }
        public BonusComponentDto Bonus { get; set; }

        public decimal GratuityAmount { get; set; }
        public decimal NoticePeriodAmount { get; set; }

        public decimal NetPayable { get; set; }
    }

    public class SalaryComponentDTO
    {
        public string ExitMonth { get; set; }
        public int TotalDays { get; set; }
        public decimal PaidDays { get; set; }

        public decimal EarnedGross { get; set; }

        public decimal MonthlyGross { get; set; }
        public decimal TotalDeductions { get; set; }
        public decimal PayableAmount { get; set; }

        // --- ADD THESE LISTS ---
        public List<ComponentBreakdownDto> EarningBreakdown { get; set; } = new();
        public List<ComponentBreakdownDto> DeductionBreakdown { get; set; } = new();
    }

    public class ComponentBreakdownDto
    {
        public string Name { get; set; }
        public decimal Amount { get; set; }

        public decimal OriginalAmount { get; set; }
    }

    public class LeaveComponentDto
    {
        public int BalanceDays { get; set; }
        public decimal RatePerDay { get; set; }
        public decimal Amount { get; set; }
    }

    public class BonusComponentDto
    {
        public string Description { get; set; }
        public decimal Amount { get; set; }
    }
}
