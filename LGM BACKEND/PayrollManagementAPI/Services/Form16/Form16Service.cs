
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CompanyPlatform.Core.Data;
using PayrollManagementAPI.DTO.Form16;
using PayrollManagementAPI.DTO.TaxCalculation;
using CompanyPlatform.Core.Models;
using PayrollManagementAPI.Services.TaxCalculation; 
using System.IO.Compression;
using UglyToad.PdfPig; 
using UglyToad.PdfPig.Content; 

using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Diagnostics;
using System.Text.RegularExpressions;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models;


namespace PayrollManagementAPI.Services.Form16
{
    public class Form16Service : IForm16Service
    {
        private readonly ApplicationDBContext _context;
        private readonly ITaxCalculationService _taxCalculationService;

        public Form16Service(ApplicationDBContext context, ITaxCalculationService taxCalculationService)
        {
            _context = context;
            _taxCalculationService = taxCalculationService;
        }


        //public async Task<IActionResult> GeneratePartBAsync(int employeeId, string financialYear)
        //{
        //    var status = await _context.Tbl_Form16Status.FirstOrDefaultAsync(s => s.EmployeeID == employeeId && s.FinancialYear == financialYear);
        //    if (status == null)
        //    {
        //        return new BadRequestObjectResult("Form 16 record not found.");
        //    }

        //    var employee = await _context.Employees.FindAsync(employeeId);
        //    //var taxDeclaration = await _context.Tbl_EmployeeTaxDeclarations.FirstOrDefaultAsync(td => td.EmployeeID == employeeId && td.FinancialYear == financialYear);

        //    if (employee == null)
        //    {
        //        return new BadRequestObjectResult("Essential employee  data is missing. Cannot generate Part B.");
        //    }

        //    // If all checks pass, update the status.
        //    status.PartBStatus = "Generated";
        //    await _context.SaveChangesAsync();

        //    return new OkObjectResult(new { message = "Part B status set to 'Generated' successfully." });
        //}

        //// NEW: This method prepares and returns the data for the PDF.
        //public async Task<Form16PartBDto?> GetForm16DataAsync(int form16StatusId)
        //{
        //    var status = await _context.Tbl_Form16Status.FindAsync(form16StatusId);
        //    if (status == null) return null;

        //    int employeeId = status.EmployeeID;
        //    string financialYear = status.FinancialYear;

        //    var employee = await _context.Employees.FindAsync(employeeId);
        //    var statutoryDetails = await _context.Tb_EmployeeStatutoryDetails.FirstOrDefaultAsync(sd => sd.EmployeeID == employeeId);
        //    var companyProfile = await _context.Tbl_CompanyProfiles.FirstOrDefaultAsync(); 
        //    //var taxDeclaration = await _context.Tbl_EmployeeTaxDeclarations
        //    //    .Include(td => td.DeclarationDetails)
        //    //    .FirstOrDefaultAsync(td => td.EmployeeID == employeeId && td.FinancialYear == financialYear);

        //    if (employee == null || statutoryDetails == null || companyProfile == null)
        //    {
        //        return null;
        //    }

        //    var salaryBreakdown = await GetProjectedSalaryBreakdownAsync(employeeId, financialYear);

        //    decimal grossSalary = salaryBreakdown.Where(c => c.ComponentName != "TDS" && c.ComponentName != "Income Tax").Sum(b => b.TotalAmount);
        //    string assumedTaxRegime = "New"; 
        //    decimal standardDeduction = 75000m; 

        //    var salaryDetails = new SalaryDetails
        //    {
        //        GrossSalarySec17_1 = grossSalary,
        //        PerquisitesSec17_2 = 0, 
        //        ProfitsInLieuOfSalarySec17_3 = 0,
        //        //HraSec10_13A = taxDeclaration.DeclarationDetails.FirstOrDefault(d => d.Section == "HRA")?.ApprovedAmount ?? 0,
        //        HraSec10_13A = 0,
        //        StandardDeduction16_ia = standardDeduction,
        //        IncomeFromOtherSources = 0, 
        //        Deduction80C = 0, 
        //        Deduction80D = 0,
        //        //IncomeFromOtherSources = taxDeclaration.DeclarationDetails.FirstOrDefault(d => d.Section == "OtherIncome")?.ApprovedAmount ?? 0,
        //        //Deduction80C = taxDeclaration.DeclarationDetails.Where(d => d.Section == "80C").Sum(d => d.ApprovedAmount ?? 0),
        //        //Deduction80D = taxDeclaration.DeclarationDetails.Where(d => d.Section == "80D").Sum(d => d.ApprovedAmount ?? 0),
        //    };

        //    var taxResult = _taxCalculationService.CalculateTax(salaryDetails.TotalTaxableIncome, assumedTaxRegime, financialYear);

        //    // 3. Assemble the Final DTO using 100% database values
        //    int startYear = int.Parse(financialYear.Split('-')[0]);
        //    var partBData = new Form16PartBDto
        //    {
        //        Header = new HeaderInfo
        //        {
        //            CertificateNo = status.CertificateNo ?? "N/A", // From database
        //            LastUpdatedOn = status.LastUpdated.ToString("dd-MMM-yyyy"), // From database
        //            AssessmentYear = $"{startYear + 1}-{startYear + 2}",
        //            PeriodFrom = new DateTime(startYear, 4, 1).ToString("dd-MMM-yyyy"),
        //            PeriodTo = new DateTime(startYear + 1, 3, 31).ToString("dd-MMM-yyyy")
        //        },
        //        Employer = new EmployerInfo
        //        {
        //            CompanyName = companyProfile.CompanyName ?? string.Empty,
        //            CompanyAddress = companyProfile.Address ?? string.Empty,
        //            //CompanyEmail = companyProfile.Email ?? string.Empty,
        //            Pan = companyProfile.PAN ?? string.Empty,
        //            Tan = companyProfile.TAN ?? string.Empty,
        //            CitTdsAddress = companyProfile.CittdsAddress ?? string.Empty
        //        },
        //        Employee = new EmployeeInfo
        //        {
        //            FullName = $"{employee.FirstName} {employee.LastName}",
        //            Address = employee.PresentAddress ?? string.Empty,
        //            Pan = statutoryDetails.PANNumber ?? string.Empty,
        //            IsOptingOutOf115BAC = (assumedTaxRegime == "Old")
        //        },
        //        SalaryBreakdown = salaryDetails,
        //        TaxCalculation = new TaxComputation
        //        {
        //            TaxOnTotalIncome = taxResult.TotalIncomeTax,
        //            Rebate87A = taxResult.RebateUnder87A,
        //            HealthAndEducationCess = taxResult.HealthAndEducationCess,
        //            TdsDeductedByEmployer = salaryBreakdown.FirstOrDefault(c => c.ComponentName == "TDS" || c.ComponentName == "Income Tax")?.TotalAmount ?? 0
        //        },
        //        Verification = new VerificationInfo
        //        {
        //            SignatoryName = companyProfile.SignatoryName ?? string.Empty,
        //            SignatoryDesignation = companyProfile.SignatoryDesignation ?? string.Empty,
        //            Place = companyProfile.Address ?? string.Empty,
        //            Date = DateTime.Now.ToString("dd-MMM-yyyy"), 
        //           // SignatorySonDaughterOf = companyProfile.SignatoryFatherName ?? string.Empty
        //        }
        //    };

        //    return partBData;
        //}

        ////private async Task<List<MonthlyEarningDto>> GetProjectedSalaryBreakdownAsync(int employeeId, string financialYear)
        ////{
        ////    return await _context.Tb_MonthlySalaryRecords
        ////        .Include(r => r.ComponentDetails)
        ////        .Where(r => r.EmployeeID == employeeId)
        ////        .SelectMany(r => r.ComponentDetails)
        ////        .Where(cd => cd.ComponentType == "Earning" || cd.ComponentName == "TDS" || cd.ComponentName == "Income Tax")
        ////        .GroupBy(cd => cd.ComponentName)
        ////        .Select(g => new MonthlyEarningDto
        ////        {
        ////            ComponentName = g.Key,
        ////            TotalAmount = g.Sum(c => c.Amount)
        ////        })
        ////        .ToListAsync();
        ////}

        //private async Task<List<MonthlyEarningDto>> GetProjectedSalaryBreakdownAsync(int employeeId, string financialYear)
        //{
        //    if (!int.TryParse(financialYear.Split('-')[0], out int startYear))
        //    {
        //        return new List<MonthlyEarningDto>();
        //    }
        //    int endYear = startYear + 1;

        //    var financialYearStart = new DateTime(startYear, 4, 1);
        //    var financialYearEnd = new DateTime(endYear, 3, 31);

        //    return await _context.Tb_MonthlySalaryRecords
        //        .Include(r => r.ComponentDetails)
        //        .Include(r => r.PayrollRun) 
        //        .Where(r => r.EmployeeID == employeeId &&
        //                     ((r.PayrollRun.Year == startYear && r.PayrollRun.Month >= 4) ||
        //                      (r.PayrollRun.Year == endYear && r.PayrollRun.Month <= 3)))
        //        .SelectMany(r => r.ComponentDetails)
        //        .Where(cd => cd.ComponentType == "Earning" || cd.ComponentName == "TDS" || cd.ComponentName == "Income Tax")
        //        .GroupBy(cd => cd.ComponentName)
        //        .Select(g => new MonthlyEarningDto
        //        {
        //            ComponentName = g.Key,
        //            TotalAmount = g.Sum(c => c.Amount)
        //        })
        //        .ToListAsync();
        //}

        //public async Task<Form16DashboardDto> GetForm16DashboardAsync(string financialYear)
        //{
        //    var activeEmployeeIds = await _context.Employees
        //        .Where(e => e.IsActive && !e.IsDeleted)
        //        .Select(e => e.ID)
        //        .ToListAsync();

        //    if (!activeEmployeeIds.Any())
        //    {
        //        return new Form16DashboardDto
        //        {
        //            Summary = new Form16SummaryDto(),
        //            EmployeeStatusList = new List<Form16StatusDto>()
        //        };
        //    }

        //    await CreateMissingForm16Statuses(activeEmployeeIds, financialYear);

        //    var statusQuery = from status in _context.Tbl_Form16Status
        //                      join emp in _context.Employees on status.EmployeeID equals emp.ID
        //                      join statDetail in _context.Tb_EmployeeStatutoryDetails on emp.ID equals statDetail.EmployeeID into detailsGroup
        //                      from detail in detailsGroup.DefaultIfEmpty()
        //                      where status.FinancialYear == financialYear && activeEmployeeIds.Contains(emp.ID)
        //                      select new Form16StatusDto
        //                      {
        //                          Id = status.ID,
        //                          EmployeeId = emp.ID,
        //                          EmployeeCode = emp.EmployeeCode,
        //                          Name = $"{emp.FirstName} {emp.LastName}",
        //                          Pan = detail != null ? detail.PANNumber : "N/A",
        //                          PartAStatus = status.PartAStatus,
        //                          PartBStatus = status.PartBStatus,
        //                          FinalStatus = status.FinalStatus
        //                      };

        //    var statusDtos = await statusQuery.ToListAsync();

        //    var summary = new Form16SummaryDto
        //    {
        //        TotalEmployees = activeEmployeeIds.Count,
        //        PartAUploaded = statusDtos.Count(s => s.PartAStatus == "Uploaded"),
        //        PartBGenerated = statusDtos.Count(s => s.PartBStatus == "Generated"),
        //        Published = statusDtos.Count(s => s.FinalStatus == "Published")
        //    };

        //    return new Form16DashboardDto
        //    {
        //        Summary = summary,
        //        EmployeeStatusList = statusDtos
        //    };
        //}

        //private async Task CreateMissingForm16Statuses(List<int> employeeIds, string financialYear)
        //{
        //    var existingEmployeeIds = await _context.Tbl_Form16Status
        //        .Where(s => employeeIds.Contains(s.EmployeeID) && s.FinancialYear == financialYear)
        //        .Select(s => s.EmployeeID)
        //        .ToListAsync();

        //    var missingEmployeeIds = employeeIds.Where(id => !existingEmployeeIds.Contains(id)).ToList();

        //    if (missingEmployeeIds.Any())
        //    {
        //        var newStatuses = missingEmployeeIds.Select(id => new Model.Form16Status
        //        {
        //            EmployeeID = id,
        //            FinancialYear = financialYear
        //        }).ToList();

        //        await _context.Tbl_Form16Status.AddRangeAsync(newStatuses);
        //        await _context.SaveChangesAsync();
        //    }
        //}

        //public async Task<EmployeeForm16ViewDto> GetEmployeeForm16StatusAsync(int employeeId, string financialYear)
        //{
        //    var status = await _context.Tbl_Form16Status
        //        .FirstOrDefaultAsync(s => s.EmployeeID == employeeId && s.FinancialYear == financialYear);

        //    if (status != null && status.FinalStatus == "Published")
        //    {
        //        return new EmployeeForm16ViewDto
        //        {
        //            FinancialYear = financialYear,
        //            Status = "Published",
        //            DownloadId = status.ID
        //        };
        //    }

        //    return new EmployeeForm16ViewDto
        //    {
        //        FinancialYear = financialYear,
        //        Status = "Not Available",
        //        DownloadId = null
        //    };
        //}
        //public async Task<IActionResult> PublishFormAsync(int form16StatusId)
        //{
        //    var status = await _context.Tbl_Form16Status.FindAsync(form16StatusId);
        //    if (status == null || status.PartBStatus != "Generated")
        //    {
        //        return new BadRequestObjectResult("Part B must be generated before publishing.");
        //    }

        //    status.FinalStatus = "Published";
        //    status.LastUpdated = DateTime.UtcNow;
        //    await _context.SaveChangesAsync();


        //    return new OkObjectResult(new { message = "Form 16 published successfully." });
        //}



        //public async Task<UploadResultDto> ProcessPartAUploadAsync(Stream fileStream, string financialYear)
        //{
        //    var result = new UploadResultDto();
        //    Debug.WriteLine("=== STARTING PART A UPLOAD ===");

        //    try
        //    {
        //        using var ms = new MemoryStream();
        //        await fileStream.CopyToAsync(ms);
        //        ms.Position = 0;

        //        using var archive = new ZipArchive(ms, ZipArchiveMode.Read);

        //        foreach (var entry in archive.Entries)
        //        {
        //            if (string.IsNullOrWhiteSpace(entry.Name) ||
        //                !entry.Name.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
        //                continue;

        //            // ---------- PAN EXTRACTION (UNCHANGED) ----------
        //            var panMatch = System.Text.RegularExpressions.Regex.Match(
        //                entry.Name.ToUpper(),
        //                @"[A-Z]{5}[0-9]{4}[A-Z]");

        //            if (!panMatch.Success)
        //            {
        //                result.FailureCount++;
        //                result.FailedFiles.Add($"{entry.Name} (Invalid PAN format)");
        //                continue;
        //            }

        //            string panFromFileName = panMatch.Value;

        //            var statutoryDetail = await _context.Tb_EmployeeStatutoryDetails
        //                .FirstOrDefaultAsync(x => x.PANNumber.Trim().ToUpper() == panFromFileName);

        //            if (statutoryDetail == null)
        //            {
        //                result.FailureCount++;
        //                result.FailedFiles.Add($"{entry.Name} (No statutory record)");
        //                continue;
        //            }

        //            var employee = await _context.Employees.FindAsync(statutoryDetail.EmployeeID);
        //            if (employee == null)
        //            {
        //                result.FailureCount++;
        //                result.FailedFiles.Add($"{entry.Name} (Employee not found)");
        //                continue;
        //            }

        //            var formStatus = await _context.Tbl_Form16Status
        //                .FirstOrDefaultAsync(x =>
        //                    x.EmployeeID == employee.ID &&
        //                    x.FinancialYear == financialYear);

        //            if (formStatus == null)
        //            {
        //                formStatus = new Model.Form16Status
        //                {
        //                    EmployeeID = employee.ID,
        //                    FinancialYear = financialYear,
        //                    PartAStatus = "Pending"
        //                };
        //                await _context.Tbl_Form16Status.AddAsync(formStatus);
        //            }

        //            // ---------- 🔥 FIXED CERTIFICATE EXTRACTION ----------
        //            string certificateNo;

        //            using (var pdfStream = entry.Open())
        //            using (var pdfMs = new MemoryStream())
        //            {
        //                await pdfStream.CopyToAsync(pdfMs);
        //                pdfMs.Position = 0;

        //                using var document = PdfDocument.Open(pdfMs);
        //                string pageText = document.GetPage(1).Text;

        //                // 1️⃣ Extract ONLY the line containing "Certificate No."
        //                var lineMatch = System.Text.RegularExpressions.Regex.Match(
        //                    pageText,
        //                    @"Certificate\s*No\.?\s*[:\-]?\s*(.+)",
        //                    System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        //                if (!lineMatch.Success)
        //                {
        //                    result.FailureCount++;
        //                    result.FailedFiles.Add($"{entry.Name} (Certificate No not found)");
        //                    continue;
        //                }

        //                string rawValue = lineMatch.Groups[1].Value.Trim();

        //                // 2️⃣ Remove known trailing labels caused by PDF merge
        //                rawValue = System.Text.RegularExpressions.Regex
        //                    .Replace(rawValue, @"\s*(Last|Date|Updated).*", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
        //                    .Trim();

        //                // 3️⃣ Final safety: keep only alphanumerics
        //                certificateNo = System.Text.RegularExpressions.Regex
        //                    .Match(rawValue, @"^[A-Z0-9\/\-]+", System.Text.RegularExpressions.RegexOptions.IgnoreCase)
        //                    .Value;

        //                if (string.IsNullOrWhiteSpace(certificateNo))
        //                {
        //                    result.FailureCount++;
        //                    result.FailedFiles.Add($"{entry.Name} (Invalid Certificate No)");
        //                    continue;
        //                }
        //            }

        //            // ---------- UPDATE (UNCHANGED) ----------
        //            formStatus.PartAStatus = "Uploaded";
        //            formStatus.CertificateNo = certificateNo;
        //            formStatus.LastUpdated = DateTime.UtcNow;

        //            result.SuccessCount++;
        //        }

        //        await _context.SaveChangesAsync();

        //        result.Message =
        //            $"Processing complete. {result.SuccessCount} succeeded, {result.FailureCount} failed.";
        //    }
        //    catch (Exception ex)
        //    {
        //        Debug.WriteLine($"FATAL ERROR: {ex}");
        //        result.Message = "Unexpected error during upload.";
        //    }

        //    return result;
        //}

        public async Task<Form16PartBDto?> GetForm16DataAsync(int form16StatusId)
        {
            var status = await _context.Tbl_Form16Status.FindAsync(form16StatusId);
            if (status == null) return null;

            int employeeId = status.EmployeeID;
            string financialYear = status.FinancialYear;
            var employee = await _context.Employees.FindAsync(employeeId);
            var statutoryDetails = await _context.Tb_EmployeeStatutoryDetails.FirstOrDefaultAsync(sd => sd.EmployeeID == employeeId);
            var companyProfile = await _context.Tbl_CompanyProfiles.FirstOrDefaultAsync();
            var taxDeclaration = await _context.Tbl_EmployeeTaxDeclarations
                .Include(td => td.DeclarationDetails)
                .FirstOrDefaultAsync(td => td.EmployeeID == employeeId && td.FinancialYear == financialYear);

            if (employee == null || statutoryDetails == null || companyProfile == null)
            {
                return null;
            }

            string chosenTaxRegime = taxDeclaration?.TaxRegime ?? "New";
            if (!int.TryParse(financialYear.Split('-')[0], out int startYear))
            {
                throw new ArgumentException("Invalid financial year format.");
            }
            var fyStartDate = new DateTime(startYear, 4, 1);
            var stdDeductionSetting = await _context.Tb_StatutorySettings
                 .Where(s => s.SettingName == "TDS_Standard_Deduction" && s.IsActive && !s.IsDeleted && s.EffectiveDate <= fyStartDate)
                 .OrderByDescending(s => s.EffectiveDate)
                 .FirstOrDefaultAsync();
            decimal standardDeduction = stdDeductionSetting != null && decimal.TryParse(stdDeductionSetting.SettingValue, out var val) ? val : 50000m;

            var salaryComponents = await GetProjectedSalaryBreakdownAsync(employeeId, financialYear);
            decimal grossSalary = salaryComponents.Where(c => c.ComponentName != "TDS" && c.ComponentName != "Income Tax").Sum(b => b.TotalAmount);
            decimal tdsDeducted = salaryComponents.FirstOrDefault(c => c.ComponentName == "TDS" || c.ComponentName == "Income Tax")?.TotalAmount ?? 0;

            var salaryDetails = new SalaryDetails
            {
                GrossSalarySec17_1 = grossSalary,
                StandardDeduction16_ia = standardDeduction,
                PerquisitesSec17_2 = 0,
                ProfitsInLieuOfSalarySec17_3 = 0,
                HraSec10_13A = 0,
                Deduction80C = 0,
                Deduction80D = 0,
                IncomeFromOtherSources = 0
            };

            if (chosenTaxRegime == "Old" && taxDeclaration != null)
            {
                salaryDetails.HraSec10_13A = taxDeclaration.DeclarationDetails.FirstOrDefault(d => d.Section == "HRA")?.ApprovedAmount ?? 0;
                salaryDetails.Deduction80C = taxDeclaration.DeclarationDetails.Where(d => d.Section == "80C").Sum(d => d.ApprovedAmount ?? 0);
                salaryDetails.Deduction80D = taxDeclaration.DeclarationDetails.FirstOrDefault(d => d.Section == "80D")?.ApprovedAmount ?? 0;
            }

            decimal deduction80CCD2 = 0;
            if (taxDeclaration != null)
            {
                salaryDetails.IncomeFromOtherSources = taxDeclaration.DeclarationDetails.FirstOrDefault(d => d.Section == "OtherIncome")?.ApprovedAmount ?? 0;
                deduction80CCD2 = taxDeclaration.DeclarationDetails.FirstOrDefault(d => d.Section == "80CCD(2)")?.ApprovedAmount ?? 0;
            }


            salaryDetails.TotalGrossSalary = salaryDetails.GrossSalarySec17_1 + salaryDetails.PerquisitesSec17_2 + salaryDetails.ProfitsInLieuOfSalarySec17_3;
            salaryDetails.TotalExemptAllowances = salaryDetails.HraSec10_13A; // Add other exemptions here if you add them in the future
            salaryDetails.TotalSalaryAfterExemptions = salaryDetails.TotalGrossSalary - salaryDetails.TotalExemptAllowances;
            salaryDetails.TotalDeductionsSec16 = salaryDetails.StandardDeduction16_ia + salaryDetails.EntertainmentAllowance16_ii + salaryDetails.ProfessionalTax16_iii;
            salaryDetails.IncomeFromSalaries = (salaryDetails.TotalSalaryAfterExemptions + salaryDetails.SalaryFromOtherEmployers) - salaryDetails.TotalDeductionsSec16;
            salaryDetails.TotalOtherIncome = salaryDetails.IncomeFromHouseProperty + salaryDetails.IncomeFromOtherSources;
            salaryDetails.GrossTotalIncome = salaryDetails.IncomeFromSalaries + salaryDetails.TotalOtherIncome;
            salaryDetails.TotalChapterVIADeductions = salaryDetails.Deduction80C + salaryDetails.Deduction80D + deduction80CCD2; // Include 80CCD2 here
            salaryDetails.TotalTaxableIncome = salaryDetails.GrossTotalIncome > salaryDetails.TotalChapterVIADeductions ? salaryDetails.GrossTotalIncome - salaryDetails.TotalChapterVIADeductions : 0;

            var taxResult = _taxCalculationService.CalculateTax(salaryDetails.TotalTaxableIncome, chosenTaxRegime, financialYear);

            var taxComputation = new TaxComputation
            {
                TaxOnTotalIncome = taxResult.TotalIncomeTax,
                Rebate87A = taxResult.RebateUnder87A,
                HealthAndEducationCess = taxResult.HealthAndEducationCess,
                TdsDeductedByEmployer = tdsDeducted
            };

            taxComputation.TaxPayable = (taxComputation.TaxOnTotalIncome + taxComputation.Surcharge + taxComputation.HealthAndEducationCess) - taxComputation.Rebate87A;
            taxComputation.NetTaxPayable = taxComputation.TaxPayable > (taxComputation.Relief89 + taxComputation.TdsDeductedByEmployer) ? taxComputation.TaxPayable - taxComputation.Relief89 - taxComputation.TdsDeductedByEmployer : 0;


            var partBData = new Form16PartBDto
            {
                Header = new HeaderInfo
                {
                    CertificateNo = status.CertificateNo ?? "N/A",
                    LastUpdatedOn = status.LastUpdated.ToString("dd-MMM-yyyy"),
                    AssessmentYear = $"{startYear + 1}-{startYear + 2}",
                    PeriodFrom = fyStartDate.ToString("dd-MMM-yyyy"),
                    PeriodTo = new DateTime(startYear + 1, 3, 31).ToString("dd-MMM-yyyy")
                },
                Employer = new EmployerInfo
                {
                    CompanyName = companyProfile.CompanyName ?? string.Empty,
                    CompanyAddress = companyProfile.Address ?? string.Empty,
                    Pan = companyProfile.PAN ?? string.Empty,
                    Tan = companyProfile.TAN ?? string.Empty,
                    CitTdsAddress = companyProfile.CittdsAddress ?? string.Empty
                },
                Employee = new EmployeeInfo
                {
                    FullName = $"{employee.FirstName} {employee.LastName}",
                    Address = employee.PresentAddress ?? string.Empty,
                    Pan = statutoryDetails.PANNumber ?? string.Empty,
                    IsOptingOutOf115BAC = (chosenTaxRegime == "Old")
                },
                SalaryBreakdown = salaryDetails,    // Assign the fully calculated object
                TaxCalculation = taxComputation,    // Assign the fully calculated object
                Verification = new VerificationInfo
                {
                    SignatoryName = companyProfile.SignatoryName ?? string.Empty,
                    SignatoryDesignation = companyProfile.SignatoryDesignation ?? string.Empty,
                    Place = companyProfile.Address ?? string.Empty,
                    Date = DateTime.Now.ToString("dd-MMM-yyyy"),
                }
            };
            return partBData;
        }


        public async Task<IActionResult> GeneratePartBAsync(int employeeId, string financialYear)
        {
            var status = await _context.Tbl_Form16Status.FirstOrDefaultAsync(s => s.EmployeeID == employeeId && s.FinancialYear == financialYear);
            if (status == null)
            {
                return new BadRequestObjectResult("Form 16 record not found.");
            }
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                return new BadRequestObjectResult("Essential employee data is missing. Cannot generate Part B.");
            }
            status.PartBStatus = "Generated";
            await _context.SaveChangesAsync();
            return new OkObjectResult(new { message = "Part B status set to 'Generated' successfully." });
        }

        private async Task<List<MonthlyEarningDto>> GetProjectedSalaryBreakdownAsync(int employeeId, string financialYear)
        {
            if (!int.TryParse(financialYear.Split('-')[0], out int startYear))
            {
                return new List<MonthlyEarningDto>();
            }
            int endYear = startYear + 1;

            return await _context.Tb_MonthlySalaryRecords
                .Include(r => r.PayrollRun)
                .Where(r => r.EmployeeID == employeeId &&
                             ((r.PayrollRun.Year == startYear && r.PayrollRun.Month >= 4) ||
                              (r.PayrollRun.Year == endYear && r.PayrollRun.Month <= 3)))
                .SelectMany(r => r.ComponentDetails)
                .Where(cd => cd.ComponentType == "Earning" || cd.ComponentName == "TDS" || cd.ComponentName == "Income Tax")
                .GroupBy(cd => cd.ComponentName)
                .Select(g => new MonthlyEarningDto
                {
                    ComponentName = g.Key,
                    TotalAmount = g.Sum(c => c.Amount)
                })
                .ToListAsync();
        }

        public async Task<Form16DashboardDto> GetForm16DashboardAsync(string financialYear)
        {
            var activeEmployeeIds = await _context.Employees
                .Where(e => e.IsActive && !e.IsDeleted)
                .Select(e => e.ID)
                .ToListAsync();

            if (!activeEmployeeIds.Any())
            {
                return new Form16DashboardDto { Summary = new Form16SummaryDto(), EmployeeStatusList = new List<Form16StatusDto>() };
            }

            await CreateMissingForm16Statuses(activeEmployeeIds, financialYear);

            var statusQuery = from status in _context.Tbl_Form16Status
                              join emp in _context.Employees on status.EmployeeID equals emp.ID
                              join statDetail in _context.Tb_EmployeeStatutoryDetails on emp.ID equals statDetail.EmployeeID into detailsGroup
                              from detail in detailsGroup.DefaultIfEmpty()
                              where status.FinancialYear == financialYear && activeEmployeeIds.Contains(emp.ID)
                              select new Form16StatusDto
                              {
                                  Id = status.ID,
                                  EmployeeId = emp.ID,
                                  EmployeeCode = emp.EmployeeCode,
                                  Name = $"{emp.FirstName} {emp.LastName}",
                                  Pan = detail != null ? detail.PANNumber : "N/A",
                                  PartAStatus = status.PartAStatus,
                                  PartBStatus = status.PartBStatus,
                                  FinalStatus = status.FinalStatus
                              };
            var statusDtos = await statusQuery.ToListAsync();
            var summary = new Form16SummaryDto
            {
                TotalEmployees = activeEmployeeIds.Count,
                PartAUploaded = statusDtos.Count(s => s.PartAStatus == "Uploaded"),
                PartBGenerated = statusDtos.Count(s => s.PartBStatus == "Generated"),
                Published = statusDtos.Count(s => s.FinalStatus == "Published")
            };
            return new Form16DashboardDto { Summary = summary, EmployeeStatusList = statusDtos };
        }

        private async Task CreateMissingForm16Statuses(List<int> employeeIds, string financialYear)
        {
            var existingEmployeeIds = await _context.Tbl_Form16Status
                .Where(s => employeeIds.Contains(s.EmployeeID) && s.FinancialYear == financialYear)
                .Select(s => s.EmployeeID)
                .ToListAsync();
            var missingEmployeeIds = employeeIds.Except(existingEmployeeIds).ToList();
            if (missingEmployeeIds.Any())
            {
                var newStatuses = missingEmployeeIds.Select(id => new Form16Status { EmployeeID = id, FinancialYear = financialYear }).ToList();
                await _context.Tbl_Form16Status.AddRangeAsync(newStatuses);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<EmployeeForm16ViewDto> GetEmployeeForm16StatusAsync(int employeeId, string financialYear)
        {
            var status = await _context.Tbl_Form16Status
                .FirstOrDefaultAsync(s => s.EmployeeID == employeeId && s.FinancialYear == financialYear);

            if (status != null && status.FinalStatus == "Published")
            {
                return new EmployeeForm16ViewDto { FinancialYear = financialYear, Status = "Published", DownloadId = status.ID };
            }
            return new EmployeeForm16ViewDto { FinancialYear = financialYear, Status = "Not Available", DownloadId = null };
        }

        public async Task<IActionResult> PublishFormAsync(int form16StatusId)
        {
            var status = await _context.Tbl_Form16Status.FindAsync(form16StatusId);
            if (status == null || status.PartBStatus != "Generated")
            {
                return new BadRequestObjectResult("Part B must be generated before publishing.");
            }
            status.FinalStatus = "Published";
            status.LastUpdated = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return new OkObjectResult(new { message = "Form 16 published successfully." });
        }

        public async Task<UploadResultDto> ProcessPartAUploadAsync(Stream fileStream, string financialYear)
        {
            var result = new UploadResultDto();
            try
            {
                using var ms = new MemoryStream();
                await fileStream.CopyToAsync(ms);
                ms.Position = 0;
                using var archive = new ZipArchive(ms, ZipArchiveMode.Read);
                foreach (var entry in archive.Entries)
                {
                    if (string.IsNullOrWhiteSpace(entry.Name) || !entry.Name.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase)) continue;
                    var panMatch = Regex.Match(entry.Name.ToUpper(), @"[A-Z]{5}[0-9]{4}[A-Z]");
                    if (!panMatch.Success)
                    {
                        result.FailureCount++; result.FailedFiles.Add($"{entry.Name} (Invalid PAN format)"); continue;
                    }
                    string panFromFileName = panMatch.Value;
                    var statutoryDetail = await _context.Tb_EmployeeStatutoryDetails.FirstOrDefaultAsync(x => x.PANNumber.Trim().ToUpper() == panFromFileName);
                    if (statutoryDetail == null)
                    {
                        result.FailureCount++; result.FailedFiles.Add($"{entry.Name} (No statutory record)"); continue;
                    }
                    var employee = await _context.Employees.FindAsync(statutoryDetail.EmployeeID);
                    if (employee == null)
                    {
                        result.FailureCount++; result.FailedFiles.Add($"{entry.Name} (Employee not found)"); continue;
                    }
                    var formStatus = await _context.Tbl_Form16Status.FirstOrDefaultAsync(x => x.EmployeeID == employee.ID && x.FinancialYear == financialYear);
                    if (formStatus == null)
                    {
                        formStatus = new Form16Status { EmployeeID = employee.ID, FinancialYear = financialYear, PartAStatus = "Pending" };
                        await _context.Tbl_Form16Status.AddAsync(formStatus);
                    }
                    string certificateNo;
                    using (var pdfStream = entry.Open())
                    using (var pdfMs = new MemoryStream())
                    {
                        await pdfStream.CopyToAsync(pdfMs);
                        pdfMs.Position = 0;
                        using var document = PdfDocument.Open(pdfMs);
                        string pageText = document.GetPage(1).Text;
                        var lineMatch = Regex.Match(pageText, @"Certificate\s*No\.?\s*[:\-]?\s*(.+)", RegexOptions.IgnoreCase);
                        if (!lineMatch.Success) { result.FailureCount++; result.FailedFiles.Add($"{entry.Name} (Certificate No not found)"); continue; }
                        string rawValue = lineMatch.Groups[1].Value.Trim();
                        rawValue = Regex.Replace(rawValue, @"\s*(Last|Date|Updated).*", "", RegexOptions.IgnoreCase).Trim();
                        certificateNo = Regex.Match(rawValue, @"^[A-Z0-9\/\-]+", RegexOptions.IgnoreCase).Value;
                        if (string.IsNullOrWhiteSpace(certificateNo)) { result.FailureCount++; result.FailedFiles.Add($"{entry.Name} (Invalid Certificate No)"); continue; }
                    }
                    formStatus.PartAStatus = "Uploaded";
                    formStatus.CertificateNo = certificateNo;
                    formStatus.LastUpdated = DateTime.UtcNow;
                    result.SuccessCount++;
                }
                await _context.SaveChangesAsync();
                result.Message = $"Processing complete. {result.SuccessCount} succeeded, {result.FailureCount} failed.";
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"FATAL ERROR: {ex}");
                result.Message = "Unexpected error during upload.";
            }
            return result;
        }


    }
}