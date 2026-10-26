using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO;
using PayrollManagementAPI.DTO.SalaryStructure;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Repository;
using System.Security.Claims;

namespace PayrollManagementAPI.Services.SalaryStructure
{
    public class SalaryStructureService : ISalaryStructureService
    {
        private readonly ApplicationDBContext _context;

        public SalaryStructureService(ApplicationDBContext context)
        {
            _context = context;
        }

        // GET (All Pivoted for Main View)
        public async Task<IEnumerable<SalaryStructureViewDto>> GetSalaryStructureViewAsync(ClaimsPrincipal user)
        {
            _ = int.TryParse(user.FindFirstValue("EmployeeId"), out var currentEmployeeId);
            var currentUserRole = user.FindFirstValue(ClaimTypes.Role);
            _ = int.TryParse(user.FindFirstValue("DepartmentID"), out var currentUserDeptId);

            var query = _context.Tb_SalaryStructures
                .Include(s => s.Employee).ThenInclude(e => e.Department)
                .Include(s => s.SalaryComponent)
                .Where(s => s.IsDeleted == false);

            if (currentUserRole == "Admin")
            {
            }
            else if (currentUserRole == "HR")
            {
                query = query.Where(s => s.Employee.DepartmentID == currentUserDeptId);
            }
            else 
            {
                query = query.Where(s => s.EmployeeID == currentEmployeeId);
            }

            var allStructures = await query.ToListAsync();

            var groupedByEmployee = allStructures.GroupBy(s => s.Employee);
            var resultList = new List<SalaryStructureViewDto>();

            foreach (var group in groupedByEmployee)
            {
                var employee = group.Key;
                var components = group.ToList();
                var viewDto = new SalaryStructureViewDto
                {
                    EmployeeID = employee.ID,
                    EmployeeCode = employee.EmployeeCode,
                    EmployeeName = $"{employee.FirstName} {employee.LastName}",
                    Department = employee.Department?.DepartmentName ?? "N/A",
                    BasicPay = components.FirstOrDefault(c => c.SalaryComponent.ComponentName == "Basic Salary")?.Amount ?? 0,
                    HRA = components.FirstOrDefault(c => c.SalaryComponent.ComponentName == "HRA")?.Amount ?? 0,
                    ConveyanceAllowance = components.FirstOrDefault(c => c.SalaryComponent.ComponentName == "Conve. Allowance")?.Amount ?? 0,
                    //Esic = components.FirstOrDefault(c => c.SalaryComponent.ComponentName == "ESIC")?.Amount ?? 0,
                    //Pf = components.FirstOrDefault(c => c.SalaryComponent.ComponentName == "P. F.")?.Amount ?? 0,
                    //Pt = components.FirstOrDefault(c => c.SalaryComponent.ComponentName == "P. T.")?.Amount ?? 0,
                    //Tds = components.FirstOrDefault(c => c.SalaryComponent.ComponentName == "TDS")?.Amount ?? 0,
                    ProductionIncentive = components.FirstOrDefault(c => c.SalaryComponent.ComponentName == "Production Incentive")?.Amount ?? 0,
                    Esic = 0, 
                    Pf = 0,   
                    Pt = 0,  
                    Tds = 0,  
                    Status = components.FirstOrDefault()?.Status ?? "N/A"
                };
                viewDto.GrossSalary = components
                    .Where(c => c.SalaryComponent.ComponentType.Equals("Earning", StringComparison.OrdinalIgnoreCase))
                    .Sum(c => c.Amount);
             

                viewDto.TotalDeduction = components
                  .Where(c => c.SalaryComponent.ComponentType.Equals("Deduction", StringComparison.OrdinalIgnoreCase))
                  .Sum(c => c.Amount);

                viewDto.NetSalary = viewDto.GrossSalary - viewDto.TotalDeduction;


                resultList.Add(viewDto);
            }
            return resultList;
        }

        // GET (By Employee ID)
        public async Task<SalaryStructureDetailDto> GetSalaryStructureByEmployeeIdAsync(int employeeId)
        {
            var components = await _context.Tb_SalaryStructures
                .Include(s => s.Employee)
                .Include(s => s.SalaryComponent)
                .Where(s => s.EmployeeID == employeeId && s.IsDeleted == false)
                .ToListAsync();

            if (!components.Any()) return null;

            var first = components.First();
            return new SalaryStructureDetailDto
            {
                EmployeeID = first.EmployeeID,
                EmployeeName = $"{first.Employee.FirstName} {first.Employee.LastName}",
                EffectiveDate = first.EffectiveDate,
                Status = first.Status,
                Components = components.Select(c => new ComponentDetailItemDto
                {
                    SalaryComponentID = c.SalaryComponentID,
                    ComponentName = c.SalaryComponent.ComponentName,
                    Amount = c.Amount
                }).ToList()
            };
        }


        public async Task<SalaryStructureViewDtos> GetSalaryStructureViewByIdAsync(int employeeId)
        {

            var salarySummary = await _context.Tb_EmployeeSalarySummaries
                .Where(s => s.EmployeeID == employeeId)
                .OrderByDescending(s => s.EffectiveDate)
                .FirstOrDefaultAsync();

            var structuresForEmployee = await _context.Tb_SalaryStructures
                .Include(s => s.Employee).ThenInclude(e => e.Department)
                .Include(s => s.SalaryComponent)
                .Where(s => s.EmployeeID == employeeId && s.IsDeleted == false)
                .ToListAsync();


            if (!structuresForEmployee.Any())
            {
                return null;
            }

            var employee = structuresForEmployee.First().Employee;

            var viewDto = new SalaryStructureViewDtos
            {
                EmployeeID = employee.ID,
                EmployeeCode = employee.EmployeeCode,
                EmployeeName = $"{employee.FirstName} {employee.LastName}",
                Department = employee.Department?.DepartmentName ?? "N/A",
                AnnualCTC = salarySummary?.AnnualCTC ?? 0,
                BasicPay = structuresForEmployee.FirstOrDefault(c => c.SalaryComponent.ComponentName == "Basic Salary")?.Amount ?? 0,
                HRA = structuresForEmployee.FirstOrDefault(c => c.SalaryComponent.ComponentName == "HRA")?.Amount ?? 0,
                ConveyanceAllowance = structuresForEmployee.FirstOrDefault(c => c.SalaryComponent.ComponentName == "Conve. Allowance")?.Amount ?? 0,
                Esic = structuresForEmployee.FirstOrDefault(c => c.SalaryComponent.ComponentName == "ESIC")?.Amount ?? 0,
                Pf = structuresForEmployee.FirstOrDefault(c => c.SalaryComponent.ComponentName == "P. F.")?.Amount ?? 0,
                Pt = structuresForEmployee.FirstOrDefault(c => c.SalaryComponent.ComponentName == "P. T.")?.Amount ?? 0,
                Tds = structuresForEmployee.FirstOrDefault(c => c.SalaryComponent.ComponentName == "TDS")?.Amount ?? 0,
                ProductionIncentive = structuresForEmployee.FirstOrDefault(c => c.SalaryComponent.ComponentName == "Production Incentive")?.Amount ?? 0,
                Status = structuresForEmployee.FirstOrDefault()?.Status ?? "N/A"
            };

            viewDto.GrossSalary = structuresForEmployee
                .Where(c => c.SalaryComponent.ComponentType.Equals("Earning", StringComparison.OrdinalIgnoreCase))
                .Sum(c => c.Amount);

            viewDto.TotalDeduction = structuresForEmployee
                .Where(c => c.SalaryComponent.ComponentType.Equals("Deduction", StringComparison.OrdinalIgnoreCase))
                .Sum(c => c.Amount);

            viewDto.NetSalary = viewDto.GrossSalary - viewDto.TotalDeduction;

            return viewDto;
        }

        //public async Task<SalaryStructureDetailDto> CreateSalaryStructureAsync(SalaryStructureCreateDto dto)
        //{
        //    var existing = await _context.Tb_SalaryStructures
        //        .AnyAsync(s => s.EmployeeID == dto.EmployeeID && s.IsDeleted == false);
        //    if (existing)
        //        throw new InvalidOperationException("An active salary structure already exists for this employee. Please update it instead.");

        //    if (dto.MonthlySalary.HasValue && dto.MonthlySalary > 0)
        //    {
        //        return await CreateStructureFromMonthlySalaryAsync(dto);
        //    }
        //    else if (dto.Components != null && dto.Components.Any())
        //    {
        //        return await CreateStructureFromMonthlySalaryAsync(dto);
        //    }
        //    else
        //    {
        //        throw new ArgumentException("Either Monthly Salary or a list of components must be provided.");
        //    }
        //}

        //private async Task<SalaryStructureDetailDto> CreateStructureFromManualComponentsAsync(SalaryStructureCreateDto dto)
        //{
        //    var newEntities = new List<Model.SalaryStructure>();
        //    foreach (var componentInput in dto.Components)
        //    {
        //        var structureEntity = new Model.SalaryStructure
        //        {
        //            EmployeeID = dto.EmployeeID,
        //            SalaryComponentID = componentInput.SalaryComponentID,
        //            Amount = componentInput.Amount,
        //            EffectiveDate = dto.EffectiveDate,
        //            Status = dto.Status,
        //            IsDeleted = false
        //        };
        //        newEntities.Add(structureEntity);
        //    }
        //    await _context.Tb_SalaryStructures.AddRangeAsync(newEntities);
        //    await _context.SaveChangesAsync();

        //    return await GetSalaryStructureByEmployeeIdAsync(dto.EmployeeID);
        //}

        //private async Task<SalaryStructureDetailDto> CreateStructureFromMonthlySalaryAsync(SalaryStructureCreateDto dto)
        //{
        //    var employee = await _context.Employees.FindAsync(dto.EmployeeID);
        //    if (employee == null)
        //    {
        //        throw new ArgumentException($"Employee with ID {dto.EmployeeID} not found.");
        //    }

        //    var pfDetails = await _context.EmployeePFDetails
        //    .FirstOrDefaultAsync(p => p.EmployeeID == dto.EmployeeID && !p.IsDeleted);

        //    var pfDeductionPercentage = pfDetails?.PFDeductionPercentage ?? 12.0m;

        //    var monthlyGrossSalary = dto.MonthlySalary.Value;
        //    var newStructureEntities = new List<Model.SalaryStructure>();

        //    decimal monthlyBasic = monthlyGrossSalary * 0.60m;
        //    decimal monthlyHRA = monthlyGrossSalary * 0.20m;
        //    decimal monthlyConveAllowance = monthlyGrossSalary * 0.20m;
        //    ////decimal employeePF = monthlyBasic * 0.12m;
        //    //decimal employeePF = monthlyBasic * (pfDeductionPercentage / 100.0m);
        //    //const decimal employerPF = 1800m;

        //    decimal employeePF;
        //    decimal employerPF;

        //    if (monthlyGrossSalary <= 15000m)
        //    {
        //        // For gross salary <= 15000, PF is 12% of the gross salary.
        //        employeePF = monthlyGrossSalary * 0.12m;
        //        employerPF = monthlyGrossSalary * 0.12m;
        //    }
        //    else
        //    {
        //        // For gross salary > 15000, use the existing logic.
        //        employeePF = monthlyBasic * (pfDeductionPercentage / 100.0m);
        //        employerPF = 1800m; // The fixed amount for higher salaries.
        //    }

        //    decimal professionalTax = 0m;
        //    string gender = (employee.Gender ?? "").Trim().ToLower();

        //    if (gender == "female")
        //    {
        //        professionalTax = monthlyGrossSalary >= 25000 ? 200 : 0;
        //    }
        //    else
        //    {
        //        if (monthlyGrossSalary > 10000)
        //            professionalTax = 200;
        //        else if (monthlyGrossSalary >= 7500)
        //            professionalTax = 175;
        //    }
        //    decimal esic = monthlyBasic * 0.0075m;

        //    decimal annualGrossSalary = monthlyGrossSalary * 12;
        //    decimal annualTDS = CalculateTDS_NewRegime_FY2025_26(annualGrossSalary);
        //    decimal monthlyTDS = (annualTDS > 0) ? Math.Round(annualTDS / 12, 2) : 0;

        //    var allDbComponents = await _context.Tb_SalaryComponents.ToListAsync();
        //    var allDbComponentsDict = allDbComponents.ToDictionary(c => c.ComponentName, c => c);

        //    var componentNames = new List<string> {
        //        "Basic Salary", "HRA", "Conve. Allowance", "P. F.", "P. T.", "ESIC", "TDS"
        //     };
        //    int GetCompId(string name) => allDbComponentsDict.TryGetValue(name, out var comp) ? comp.Id : 0;

        //    var componentData = new Dictionary<string, decimal>
        //    {
        //         { "Basic Salary", monthlyBasic },
        //         { "HRA", monthlyHRA },
        //         { "Conve. Allowance", monthlyConveAllowance},
        //         { "P. F.", employeePF },
        //         { "P. T.", professionalTax },
        //         { "ESIC", esic },
        //         { "TDS", monthlyTDS }
        //    };

        //    if (dto.Components != null)
        //    {
        //        foreach (var manualComp in dto.Components)
        //        {
        //            var comp = allDbComponents.FirstOrDefault(c => c.Id == manualComp.SalaryComponentID);
        //            if (comp != null && !componentData.ContainsKey(comp.ComponentName))
        //            {
        //                componentData[comp.ComponentName] = manualComp.Amount;
        //            }
        //        }
        //    }

        //    foreach (var item in componentData)
        //    {
        //        int componentId = GetCompId(item.Key);
        //        if (componentId > 0 && item.Value > 0)
        //        {
        //            newStructureEntities.Add(new Model.SalaryStructure
        //            {
        //                EmployeeID = dto.EmployeeID,
        //                SalaryComponentID = componentId,
        //                Amount = Math.Round(item.Value, 2),
        //                EffectiveDate = dto.EffectiveDate,
        //                Status = dto.Status
        //            });
        //        }
        //    }

        //    decimal finalMonthlyGrossSalary = 0;
        //    decimal finalTotalMonthlyDeductions = 0;

        //    foreach (var entry in componentData)
        //    {
        //        if (allDbComponentsDict.TryGetValue(entry.Key, out var comp))
        //        {
        //            if (comp.ComponentType.Equals("Earning", StringComparison.OrdinalIgnoreCase))
        //            {
        //                finalMonthlyGrossSalary += entry.Value;
        //            }
        //            else if (comp.ComponentType.Equals("Deduction", StringComparison.OrdinalIgnoreCase))
        //            {
        //                finalTotalMonthlyDeductions += entry.Value;
        //            }
        //        }
        //    }

        //    decimal finalNetMonthlySalary = finalMonthlyGrossSalary - finalTotalMonthlyDeductions;

        //    decimal annualCTC = (finalMonthlyGrossSalary * 12) + (employerPF * 12);

        //    var salarySummary = new Model.EmployeeSalarySummary
        //    {
        //        EmployeeID = dto.EmployeeID,
        //        AnnualCTC = Math.Round(annualCTC, 2),
        //        EmployerPF = employerPF,
        //        MonthlyGrossSalary = Math.Round(finalMonthlyGrossSalary, 2), 
        //        MonthlyTotalDeduction = Math.Round(finalTotalMonthlyDeductions, 2), 
        //        MonthlyNetSalary = Math.Round(finalNetMonthlySalary, 2), 
        //        CalculationDate = DateTime.UtcNow,
        //        EffectiveDate = dto.EffectiveDate
        //    };

        //    await _context.Tb_EmployeeSalarySummaries.AddAsync(salarySummary);
        //    await _context.Tb_SalaryStructures.AddRangeAsync(newStructureEntities);
        //    await _context.SaveChangesAsync();

        //    return await GetSalaryStructureByEmployeeIdAsync(dto.EmployeeID);
        //}


        //private decimal CalculateTDS_NewRegime_FY2025_26(decimal annualGrossSalary)
        //{
        //    const decimal StandardDeduction = 75000m;

        //    decimal taxableIncome = Math.Max(0, annualGrossSalary - StandardDeduction);

        //    decimal tax = 0m;

        //    if (taxableIncome > 2400000)
        //        tax += (taxableIncome - 2400000) * 0.30m;

        //    if (taxableIncome > 2000000)
        //        tax += (Math.Min(taxableIncome, 2400000) - 2000000) * 0.25m;

        //    if (taxableIncome > 1600000)
        //        tax += (Math.Min(taxableIncome, 2000000) - 1600000) * 0.20m;

        //    if (taxableIncome > 1200000)
        //        tax += (Math.Min(taxableIncome, 1600000) - 1200000) * 0.15m;

        //    if (taxableIncome > 800000)
        //        tax += (Math.Min(taxableIncome, 1200000) - 800000) * 0.10m;

        //    if (taxableIncome > 400000)
        //        tax += (Math.Min(taxableIncome, 800000) - 400000) * 0.05m;

        //    if (taxableIncome <= 1200000)  //if annual salary less than 1200000 then tds become 0
        //        tax = 0;

        //    decimal totalTax = tax + (tax * 0.04m); //add into eductaional,medical fund

        //    return totalTax;
        //}

        public async Task<SalaryStructureDetailDto> CreateSalaryStructureAsync(SalaryStructureCreateDto dto)
        {
            var existing = await _context.Tb_SalaryStructures
                .AnyAsync(s => s.EmployeeID == dto.EmployeeID && s.IsDeleted == false);
            if (existing)
                throw new InvalidOperationException("An active salary structure already exists for this employee. Please update it instead.");


            if (dto.MonthlySalary.HasValue && dto.MonthlySalary > 0)
            {
                return await CreateStructureFromMonthlySalaryAsync(dto);
            }
            else if (dto.Components != null && dto.Components.Any())
            {
                var earningComponentIds = await _context.Tb_SalaryComponents
                    .Where(c => c.ComponentType.Equals("Earning", StringComparison.OrdinalIgnoreCase))
                    .Select(c => c.Id)
                    .ToListAsync();

                decimal calculatedGross = dto.Components
                    .Where(c => earningComponentIds.Contains(c.SalaryComponentID))
                    .Sum(c => c.Amount);

                if (calculatedGross <= 0)
                {
                    throw new ArgumentException("Cannot create a structure with non-positive earning components.");
                }

                dto.MonthlySalary = calculatedGross;

                return await CreateStructureFromMonthlySalaryAsync(dto);
            }
            else
            {
                throw new ArgumentException("Either Monthly Salary or a list of components must be provided.");
            }
        }

        private async Task<SalaryStructureDetailDto> CreateStructureFromMonthlySalaryAsync(SalaryStructureCreateDto dto)
        {
           

            var employee = await _context.Employees.Include(e => e.WorkLocation) // Assuming location holds the state info
                .FirstOrDefaultAsync(e => e.ID == dto.EmployeeID);

            if (employee == null)
            {
                throw new ArgumentException($"Employee with ID {dto.EmployeeID} not found.");
            }

            var effectiveDate = DateTime.UtcNow;

            // Fetch all relevant settings and store them in dictionaries for efficient lookup
            var componentSettings = await _context.Tbl_SalarySettingPercentages
                .Where(s => s.IsApplicable && !s.IsDeleted && s.EffectiveFrom <= effectiveDate && (s.EffectiveTo == null || s.EffectiveTo >= effectiveDate))
                .ToDictionaryAsync(s => s.ComponentName, s => s);

            if (!componentSettings.ContainsKey("Basic Salary"))
            {
                throw new InvalidOperationException("Critical salary setting for 'Basic Salary' is not configured or is not active for the current date. Please check the Salary Settings configuration.");
            }

            var statutorySettings = await _context.Tb_StatutorySettings
                .Where(s => s.IsActive && !s.IsDeleted)
                .ToDictionaryAsync(s => s.SettingName, s => s.SettingValue);

            // Fetch state-specific professional tax slabs
            var employeeState = employee.WorkLocation?.State; // Get the state, might be null

            if (string.IsNullOrWhiteSpace(employeeState))
            {
                
                employeeState = "DefaultState"; 
            }
            var professionalTaxSlabs = await _context.Tb_ProfessionalTaxSlabs
             .Where(s => s.State.Trim().ToLower() == employeeState.Trim().ToLower() && !s.IsDeleted)
             .ToListAsync();

            var pfDetails = await _context.EmployeePFDetails
                .FirstOrDefaultAsync(p => p.EmployeeID == dto.EmployeeID && !p.IsDeleted);

            var tdsDetails = await _context.EmployeeTDSDetails
            .FirstOrDefaultAsync(t => t.EmployeeID == dto.EmployeeID && !t.IsDeleted);

            var monthlyGrossSalary = dto.MonthlySalary.Value;
            var newStructureEntities = new List<CompanyPlatform.Core.Models.SalaryStructure>();


            decimal monthlyBasic = Math.Ceiling(CalculateComponentAmount(componentSettings, "Basic Salary", monthlyGrossSalary, 0));
            decimal monthlyHRA = Math.Ceiling(CalculateComponentAmount(componentSettings, "HRA", monthlyGrossSalary, monthlyBasic));
            decimal monthlyConveAllowance = Math.Ceiling(CalculateComponentAmount(componentSettings, "Conve. Allowance", monthlyGrossSalary, monthlyBasic));

            //decimal esic = Math.Ceiling(CalculateESIC(monthlyGrossSalary, statutorySettings));
            decimal esic = 0; 
            decimal employeePF = 0;
            decimal professionalTax = 0;
            decimal monthlyTDS = 0;

            decimal pfThreshold = decimal.TryParse(statutorySettings.GetValueOrDefault("PF Threshold"), out var th) ? th : 15000m;
            decimal rateBelowThreshold = decimal.TryParse(statutorySettings.GetValueOrDefault("PF Rate Below Threshold"), out var rbt) ? rbt : 12.0m;
            decimal employerFixedContribution = decimal.TryParse(statutorySettings.GetValueOrDefault("PF Employer Contribution Fixed"), out var efc) ? efc : 1800m;

            decimal employerPF = 0;

            if (monthlyGrossSalary > 0)
            {
                if (monthlyGrossSalary <= pfThreshold)
                {
                    employerPF = monthlyGrossSalary * (rateBelowThreshold / 100m);
                }
                else
                {
                    employerPF = employerFixedContribution;
                }
            }

            employerPF = Math.Ceiling(employerPF);


            //// Calculate Professional Tax using slab settings
            //decimal professionalTax = Math.Ceiling(CalculateProfessionalTax(
            //    monthlyGrossSalary,
            //    employee.Gender,
            //    professionalTaxSlabs
            //));

            //decimal monthlyTDS = tdsDetails?.TDSAmount ?? 0m;

            var allDbComponents = await _context.Tb_SalaryComponents.ToListAsync();
            var allDbComponentsDict = allDbComponents.ToDictionary(c => c.ComponentName, c => c);
            int GetCompId(string name) => allDbComponentsDict.TryGetValue(name, out var comp) ? comp.Id : 0;

            var componentData = new Dictionary<string, decimal>
            {
                { "Basic Salary", monthlyBasic },
                { "HRA", monthlyHRA },
                { "Conve. Allowance", monthlyConveAllowance },

                //{ "P. F.", employeePF },
                //{ "P. T.", professionalTax },
                //{ "ESIC", esic },
                //{ "TDS", monthlyTDS }
            };

            // Add any manually provided components that aren't auto-calculated
            if (dto.Components != null)
            {
                foreach (var manualComp in dto.Components)
                {
                    var comp = allDbComponents.FirstOrDefault(c => c.Id == manualComp.SalaryComponentID);
                    if (comp != null && !componentData.ContainsKey(comp.ComponentName))
                    {
                        componentData[comp.ComponentName] = manualComp.Amount;
                    }
                }
            }

            // Create structure entities for saving
            foreach (var item in componentData)
            {
                int componentId = GetCompId(item.Key);
                if (componentId > 0)
                {
                    newStructureEntities.Add(new CompanyPlatform.Core.Models.SalaryStructure
                    {
                        EmployeeID = dto.EmployeeID,
                        SalaryComponentID = componentId,
                        Amount = item.Value,
                        EffectiveDate = dto.EffectiveDate,
                        Status = dto.Status
                    });
                }
            }

            // Final summary calculations... (no changes needed)
            decimal finalMonthlyGrossSalary = 0;
            decimal finalTotalMonthlyDeductions = 0;
            foreach (var entry in componentData)
            {
                if (allDbComponentsDict.TryGetValue(entry.Key, out var comp))
                {
                    if (comp.ComponentType.Equals("Earning", StringComparison.OrdinalIgnoreCase))
                        finalMonthlyGrossSalary += entry.Value;
                    else if (comp.ComponentType.Equals("Deduction", StringComparison.OrdinalIgnoreCase))
                        finalTotalMonthlyDeductions += entry.Value;
                }
            }

            decimal finalNetMonthlySalary = finalMonthlyGrossSalary - finalTotalMonthlyDeductions;
            decimal annualCTC = (finalMonthlyGrossSalary * 12) + (employerPF * 12);

            var salarySummary = new CompanyPlatform.Core.Models.EmployeeSalarySummary
            {
                EmployeeID = dto.EmployeeID,
                AnnualCTC = Math.Round(annualCTC, 2),
                EmployerPF = employerPF,
                MonthlyGrossSalary = Math.Round(finalMonthlyGrossSalary, 2),
                MonthlyTotalDeduction = Math.Round(finalTotalMonthlyDeductions, 2),
                MonthlyNetSalary = Math.Round(finalNetMonthlySalary, 2),
                CalculationDate = DateTime.UtcNow,
                EffectiveDate = dto.EffectiveDate
            };

            await _context.Tb_EmployeeSalarySummaries.AddAsync(salarySummary);
            await _context.Tb_SalaryStructures.AddRangeAsync(newStructureEntities);
            await _context.SaveChangesAsync();

            return await GetSalaryStructureByEmployeeIdAsync(dto.EmployeeID);
        }

        private decimal CalculateComponentAmount(Dictionary<string, SalarySettingPercentage> settings, string componentName, decimal grossSalary, decimal basicSalary)
        {
            if (!settings.TryGetValue(componentName, out var setting))
            {
                return 0m; // Return 0 if no setting is found, preventing crashes.
            }

            if (setting.CalculationBase.Equals("Gross Salary", StringComparison.OrdinalIgnoreCase))
            {
                return grossSalary * (setting.Percentage.GetValueOrDefault() / 100m);
            }
            else if (setting.CalculationBase.Equals("Basic Salary", StringComparison.OrdinalIgnoreCase))
            {
                return basicSalary * (setting.Percentage.GetValueOrDefault() / 100m);
            }
            else if (setting.CalculationBase.Equals("Fixed Amount", StringComparison.OrdinalIgnoreCase))
            {
                return setting.FixedAmount.GetValueOrDefault();
            }

            return 0m;
        }

        private (decimal employeePF, decimal employerPF) CalculateProvidentFund(decimal grossSalary, decimal basicSalary, Dictionary<string, string> settings, decimal? employeeSpecificRate, bool isCapped)
        {
            // Get PF threshold and rates from statutory settings, with safe fallbacks
            decimal pfThreshold = decimal.TryParse(settings.GetValueOrDefault("PF_Threshold"), out var th) ? th : 15000m;
            decimal rateBelowThreshold = decimal.TryParse(settings.GetValueOrDefault("PF_Rate_Below_Threshold"), out var rbt) ? rbt : 12.0m;
            decimal employerFixedContribution = decimal.TryParse(settings.GetValueOrDefault("PF_Employer_Contribution_Fixed"), out var efc) ? efc : 1800m;

            if (grossSalary <= pfThreshold)
            {
                decimal pfAmount = grossSalary * (rateBelowThreshold / 100m);
                return (pfAmount, pfAmount);
            }
            else
            {
                decimal employeeRate = employeeSpecificRate ?? 12.0m;
                decimal empPF;

                if (isCapped)
                {
                    empPF = employerFixedContribution;
                }
                else
                {
                    empPF = basicSalary * (employeeRate / 100m);
                }

                // The employer's contribution is always fixed for salaries above the threshold.
                return (empPF, employerFixedContribution);
            }
        }

        private decimal CalculateProfessionalTax(decimal grossSalary, string gender, List<CompanyPlatform.Core.Models.ProfessionalTaxSlab> slabs)
        {
            var applicableSlab = slabs
                .Where(s =>
                    // Add Trim() here for safety, to match the frontend's robustness
                    s.Gender.Trim().Equals(gender.Trim(), StringComparison.OrdinalIgnoreCase) &&

                    grossSalary >= s.MinGrossSalary &&

                    (s.MaxGrossSalary == null || grossSalary <= s.MaxGrossSalary)
                )
                .FirstOrDefault();

            return applicableSlab?.TaxAmount ?? 0m;
        }

        private decimal CalculateESIC(decimal grossSalary, Dictionary<string, string> settings)
        {
            decimal esicThreshold = decimal.TryParse(settings.GetValueOrDefault("ESIC"), out var th) ? th : 21000m;

            decimal esicRate = 0.75m;

            if (grossSalary <= esicThreshold)
            {
                return grossSalary * (esicRate / 100m);
            }

            return 0m;
        }

        public async Task<bool> UpdateSalaryStructureAsync(int employeeId, SalaryStructureUpdateDto dto)
        {
            var existingComponentsMap = await _context.Tb_SalaryStructures
                .Where(s => s.EmployeeID == employeeId && s.IsDeleted == false)
                .ToDictionaryAsync(s => s.SalaryComponentID);

            foreach (var dtoComponent in dto.Components)
            {
                if (existingComponentsMap.TryGetValue(dtoComponent.SalaryComponentID, out var existingEntity))
                {
                    existingEntity.Amount = dtoComponent.Amount;
                    existingEntity.EffectiveDate = dto.EffectiveDate;
                    existingEntity.Status = dto.Status;
                }
                else if (dtoComponent.Amount > 0)
                {
                    var newEntity = new CompanyPlatform.Core.Models.SalaryStructure
                    {
                        EmployeeID = employeeId,
                        SalaryComponentID = dtoComponent.SalaryComponentID,
                        Amount = dtoComponent.Amount,
                        EffectiveDate = dto.EffectiveDate,
                        Status = dto.Status,
                        IsDeleted = false
                    };

                    _context.Tb_SalaryStructures.Add(newEntity);
                }
            }

            await _context.SaveChangesAsync();

            return true;
        }

        // DELETE (Soft Delete)
        public async Task<bool> DeleteSalaryStructureAsync(int employeeId)
        {
            var components = await _context.Tb_SalaryStructures
                .Where(s => s.EmployeeID == employeeId && s.IsDeleted == false)
                .ToListAsync();

            if (!components.Any()) return false;

            foreach (var component in components)
            {
                component.IsDeleted = true;
            }
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<SalaryDashboardStatsDto> GetDashboardStatsAsync(ClaimsPrincipal user)
        {
            _ = int.TryParse(user.FindFirstValue("EmployeeId"), out var currentEmployeeId);
            var currentUserRole = user.FindFirstValue(ClaimTypes.Role);
            _ = int.TryParse(user.FindFirstValue("DepartmentID"), out var currentUserDeptId);

            var activeStructureEntries = _context.Tb_SalaryStructures
                .Include(s => s.Employee) 
                .Where(s => s.IsDeleted == false);

            if (currentUserRole == "Admin")
            {
            }
            else if (currentUserRole == "HR")
            {
                activeStructureEntries = activeStructureEntries.Where(s => s.Employee.DepartmentID == currentUserDeptId);
            }
            else 
            {
                activeStructureEntries = activeStructureEntries.Where(s => s.EmployeeID == currentEmployeeId);
            }

            int totalUniqueStructures = await activeStructureEntries
                .Select(s => s.EmployeeID)
                .Distinct()
                .CountAsync();

            int pendingUpdates = await activeStructureEntries
                .Where(s => s.Status == "Pending")
                .Select(s => s.EmployeeID)
                .Distinct()
                .CountAsync();

            decimal avgBasicPay = 0;
            var basicSalaryComponent = await _context.Tb_SalaryComponents
                .FirstOrDefaultAsync(sc => sc.ComponentName == "Basic Salary"); 

            if (basicSalaryComponent != null)
            {
                var basicPayEntries = activeStructureEntries
                    .Where(s => s.SalaryComponentID == basicSalaryComponent.Id);

                if (await basicPayEntries.AnyAsync())
                {
                    avgBasicPay = await basicPayEntries.AverageAsync(s => s.Amount);
                }
            }

            return new SalaryDashboardStatsDto
            {
                TotalStructures = totalUniqueStructures, 
                EmployeesMapped = totalUniqueStructures, 
                AvgBasicPay = avgBasicPay,
                PendingUpdates = pendingUpdates
            };
        }

        public async Task<IEnumerable<SalaryStructureHistoryItemDto>> GetSalaryStructureHistoryAsync(int employeeId)
        {
            var allStructuresForEmployee = await _context.Tb_SalaryStructures
                .Include(s => s.SalaryComponent)
                .Where(s => s.EmployeeID == employeeId)
                .OrderByDescending(s => s.EffectiveDate) 
                .ToListAsync();

            if (!allStructuresForEmployee.Any())
            {
                return new List<SalaryStructureHistoryItemDto>();
            }

            var groupedByDate = allStructuresForEmployee.GroupBy(s => s.EffectiveDate);

            var historyList = new List<SalaryStructureHistoryItemDto>();

            foreach (var group in groupedByDate)
            {
                var componentsInGroup = group.ToList();
                var earnings = componentsInGroup.Where(c => c.SalaryComponent.ComponentType.Equals("Earning", StringComparison.OrdinalIgnoreCase)).ToList();
                var deductions = componentsInGroup.Where(c => c.SalaryComponent.ComponentType.Equals("Deduction", StringComparison.OrdinalIgnoreCase)).ToList();

                var gross = earnings.Sum(c => c.Amount);
                var totalDeductions = deductions.Sum(c => c.Amount);

                historyList.Add(new SalaryStructureHistoryItemDto
                {
                    EffectiveDate = group.Key,
                    Status = componentsInGroup.First().Status,
                    GrossSalary = gross,
                    TotalDeduction = totalDeductions,
                    NetSalary = gross - totalDeductions,
                    Components = componentsInGroup.Select(c => new SalaryHistoryComponentDto
                    {
                        ComponentName = c.SalaryComponent.ComponentName,
                        ComponentType = c.SalaryComponent.ComponentType,
                        Amount = c.Amount
                    }).OrderBy(c => c.ComponentType).ThenBy(c => c.ComponentName).ToList()
                });
            }

            return historyList;
        }


        public async Task<SalaryStructureDetailDto> ReviseSalaryStructureAsync(int employeeId, SalaryStructureReviseDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var currentStructure = await _context.Tb_SalaryStructures
                    .Where(s => s.EmployeeID == employeeId && !s.IsDeleted)
                    .ToListAsync();

                if (currentStructure.Any())
                {
                    foreach (var component in currentStructure)
                    {
                        component.IsDeleted = true;
                    }
                    await _context.SaveChangesAsync();
                }

                var createDto = new SalaryStructureCreateDto
                {
                    EmployeeID = employeeId,
                    MonthlySalary = dto.NewMonthlySalary,
                    EffectiveDate = dto.NewEffectiveDate,
                    Status = "Active",
                    Components = dto.Components
                };

                var newStructure = await CreateStructureFromMonthlySalaryAsync(createDto);

                await transaction.CommitAsync();

                return newStructure;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

    }
}
