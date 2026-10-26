using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.DTO.Employee;
using CompanyPlatform.Core.DTO.EmployeePFDetails;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Models.CRM.Employee;
using CompanyPlatform.Core.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Security.Claims;

namespace CompanyPlatform.Core.Services.Employee
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IRepositories<Employees> _employeeRepository;
        private readonly ApplicationDBContext _context;
        private readonly ILogger<EmployeeService> _logger;
        private readonly UserManager<ApplicationUser> _userManager;

        public EmployeeService(
            IRepositories<Employees> employeeRepository,
            ApplicationDBContext context,
            ILogger<EmployeeService> logger,
            UserManager<ApplicationUser> userManager
            )
        {
            _employeeRepository = employeeRepository;
            _context = context;
            _logger = logger;
            _userManager = userManager;
        }

        public async Task<IEnumerable<EmployeeDetailDto>> GetAllEmployeesAsync(ClaimsPrincipal user)
        {
            _ = int.TryParse(user.FindFirstValue("EmployeeId"), out var currentEmployeeId);
            //var currentUserRole = user.FindFirstValue(ClaimTypes.Role);
            var currentUserRole =
            user.FindFirstValue(ClaimTypes.Role) ??
            user.FindFirst("role")?.Value ??
            user.FindFirst("Role")?.Value;
            _ = int.TryParse(user.FindFirstValue("DepartmentID"), out var currentUserDeptId);

            _logger.LogInformation(
                "Fetching employees for UserID: {UserId}, Role: {UserRole}, DepartmentID: {UserDeptId}",
                currentEmployeeId, currentUserRole, currentUserDeptId);

            var query = _context.Employees
                .Include(e => e.WorkLocation)
                 .Include(e => e.Level)
                .Include(e => e.Department)
                .Include(e => e.Designation)
                 .Include(e => e.Level)
                .Include(e => e.ReportingToManager)
                .Include(e => e.Company)
                .Where(e => e.IsDeleted == false);

            if (currentUserRole == "Admin" || currentUserRole == "Account")
            {
                _logger.LogInformation("User is Admin/Account. Fetching all employees.");
            }
            else if (currentUserRole == "HR")
            {
                _logger.LogInformation("User is HR. Fetching employees for their DepartmentID: {DepartmentId}", currentUserDeptId);
                query = query.Where(e => e.DepartmentID == currentUserDeptId);
            }
            else 
            {
                _logger.LogInformation("User is an Employee. Fetching only their own record.");
                query = query.Where(e => e.ID == currentEmployeeId);
            }

            var employees = await query.ToListAsync();

            var employeeDtos = new List<EmployeeDetailDto>();

            foreach (var e in employees)
            {
                string role = "";
                if (!string.IsNullOrEmpty(e.EmailAddress))
                {
                    var appUser = await _userManager.FindByEmailAsync(e.EmailAddress);
                    if (appUser != null)
                    {
                        var roles = await _userManager.GetRolesAsync(appUser);
                        role = roles.FirstOrDefault();
                    }
                }

                employeeDtos.Add(new EmployeeDetailDto
                {
                    ID = e.ID,
                    EmployeeCode = e.EmployeeCode,
                    FirstName = e.FirstName,
                    MiddleName = e.MiddleName,
                    LastName = e.LastName,
                    EmailAddress = e.EmailAddress,
                    MobileNumber = e.MobileNumber,
                    DateOfBirth = e.DateOfBirth,
                    DateOfJoining = e.DateOfJoining,
                    Gender = e.Gender,
                    PresentAddress = e.PresentAddress,
                    WorkLocationID = e.WorkLocationID,
                    DepartmentID = e.DepartmentID,
                    DesignationID = e.DesignationID,
                    IsActive = e.IsActive,
                    IsDeleted = e.IsDeleted,
                    CompanyId = e.CompanyId,
                    CompanyName = e.Company?.CompanyName,
                    PhotoPath = e.PhotoPath,
                    WorkLocationName = e.WorkLocation?.LocationName,
                    DepartmentName = e.Department?.DepartmentName,
                    DesignationName = e.Designation?.DesignationName,
                    ReportingTo = e.ReportingTo,
                    LevelID = e.LevelID,
                    LevelName = e.Level?.LevelName,
                    ReportingToName = e.ReportingToManager != null ? $"{e.ReportingToManager.FirstName} {e.ReportingToManager.MiddleName} {e.ReportingToManager.LastName}" : "N/A",
                    Role = role,
                    PANNumber = _context.Tb_EmployeeStatutoryDetails
                             .Where(s => s.EmployeeID == e.ID && !s.IsDeleted)
                             .Select(s => s.PANNumber)
                             .FirstOrDefault(),

                    AadhaarNumber = _context.Tb_EmployeeStatutoryDetails
                             .Where(s => s.EmployeeID == e.ID && !s.IsDeleted)
                             .Select(s => s.AadhaarNumber)
                             .FirstOrDefault(),

                    PassportNumber = _context.Tb_EmployeeStatutoryDetails
                             .Where(s => s.EmployeeID == e.ID && !s.IsDeleted)
                             .Select(s => s.PassportNumber)
                             .FirstOrDefault()
                });
            }

            return employeeDtos;
        }

        public async Task<EmployeeDetailDto> GetEmployeeByIdAsync(int id)
        {
            _logger.LogInformation("Fetching employee by ID: {EmployeeId}", id);
            var emp = await _context.Employees
                .Include(e => e.WorkLocation)
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .Include(e => e.Level)
                .Include(e => e.ReportingToManager)
                .Include(e => e.Company)
                .FirstOrDefaultAsync(e => e.ID == id && e.IsDeleted == false);

            if (emp == null)
            {
                _logger.LogWarning("Employee with ID: {EmployeeId} not found or is inactive.", id);
                return null;
            }

            string role = ""; 
            var user = await _userManager.FindByEmailAsync(emp.EmailAddress);
            if (user != null)
            {
                var roles = await _userManager.GetRolesAsync(user);
                role = roles.FirstOrDefault(); 
            }

            return new EmployeeDetailDto
            {
                ID = emp.ID,
                EmployeeCode = emp.EmployeeCode,
                FirstName = emp.FirstName,
                MiddleName = emp.MiddleName,
                LastName = emp.LastName,
                EmailAddress = emp.EmailAddress,
                MobileNumber = emp.MobileNumber,
                DateOfBirth = emp.DateOfBirth,
                DateOfJoining = emp.DateOfJoining,
                Gender = emp.Gender,
                PresentAddress = emp.PresentAddress,
                WorkLocationID = emp.WorkLocationID,
                WorkLocationName = emp.WorkLocation?.LocationName,
                DepartmentID = emp.DepartmentID,
                DepartmentName = emp.Department?.DepartmentName,
                DesignationID = emp.DesignationID,
                DesignationName = emp.Designation?.DesignationName,
                ReportingTo = emp.ReportingTo,
                LevelID = emp.LevelID,
                LevelName = emp.Level?.LevelName,
                ReportingToName = emp.ReportingToManager != null ? $"{emp.ReportingToManager.FirstName} {emp.ReportingToManager.LastName}" : "N/A",
                Role = role,
                CompanyId = emp.CompanyId,
                CompanyName = emp.Company?.CompanyName,
                PhotoPath = emp.PhotoPath,
                IsActive = emp.IsActive,
                IsDeleted= emp.IsDeleted
            };
        }

        public async Task<EmployeeFullDetailDto> GetEmployeeFullDetailsByIdAsync(int id)
        {
            _logger.LogInformation("Fetching full details for EmployeeID: {EmployeeId}", id);

            var employeeDetails = await _context.Employees
                .Include(e => e.Company)
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .Include(e => e.WorkLocation)
                .Where(e => e.ID == id && e.IsDeleted == false)
                .Select(e => new EmployeeFullDetailDto
                {
                    ID = e.ID,
                    EmployeeCode = e.EmployeeCode,
                    GoogleCalendarId = e.GoogleCalendarId,
                    FirstName = e.FirstName,
                    MiddleName = e.MiddleName,
                    LastName = e.LastName,
                    EmailAddress = e.EmailAddress,
                    MobileNumber = e.MobileNumber,
                    DateOfBirth = e.DateOfBirth,
                    DateOfJoining = e.DateOfJoining,
                    Gender = e.Gender,
                    IsActive = e.IsActive,
                    CompanyId = e.CompanyId,
                    DepartmentID = e.DepartmentID,
                    DesignationID = e.DesignationID,
                    WorkLocationID = e.WorkLocationID,
                    CompanyName = e.Company != null ? e.Company.CompanyName : "N/A",
                    PhotoPath = e.PhotoPath,
                    WorkLocationName = e.WorkLocation != null ? e.WorkLocation.LocationName : "N/A",
                    DepartmentName = e.Department != null ? e.Department.DepartmentName : "N/A",
                    DesignationName = e.Designation != null ? e.Designation.DesignationName : "N/A",
                    LevelID = e.LevelID,
                    LevelName = e.Level != null ? e.Level.LevelName : null,
                    ReportingToName = e.ReportingToManager != null ? $"{e.ReportingToManager.FirstName} {e.ReportingToManager.LastName}" : "N/A",

                    // --- FIXED: Direct Table Query for Current Address ---
                    CurFlatNo = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Current").Select(a => a.FlatNo).FirstOrDefault(),
                    CurCountryId = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Current").Select(a => a.CountryId).FirstOrDefault(),
                    CurStateId = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Current").Select(a => a.StateId).FirstOrDefault(),
                    CurPremisesName = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Current").Select(a => a.PremisesName).FirstOrDefault(),
                    CurRoadName = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Current").Select(a => a.RoadName).FirstOrDefault(),
                    CurLocality = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Current").Select(a => a.Locality).FirstOrDefault(),
                    CurTownDistrict = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Current").Select(a => a.TownDistrict).FirstOrDefault(),
                    CurPinNo = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Current").Select(a => a.PinNo).FirstOrDefault(),
                    // Joining Country/State tables to get Names
                    CurCountryName = _context.Tbl_EmployeeAddresses.Include(a => a.Country).Where(a => a.EmployeeID == e.ID && a.AddressType == "Current").Select(a => a.Country.CountryName).FirstOrDefault(),
                    CurStateName = _context.Tbl_EmployeeAddresses.Include(a => a.State).Where(a => a.EmployeeID == e.ID && a.AddressType == "Current").Select(a => a.State.StateName).FirstOrDefault(),

                    // --- FIXED: Direct Table Query for Permanent Address ---
                    PermFlatNo = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Permanent").Select(a => a.FlatNo).FirstOrDefault(),
                    PermCountryId = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Permanent").Select(a => a.CountryId).FirstOrDefault(),
                    PermStateId = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Permanent").Select(a => a.StateId).FirstOrDefault(),
                    PermPremisesName = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Permanent").Select(a => a.PremisesName).FirstOrDefault(),
                    PermRoadName = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Permanent").Select(a => a.RoadName).FirstOrDefault(),
                    PermLocality = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Permanent").Select(a => a.Locality).FirstOrDefault(),
                    PermTownDistrict = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Permanent").Select(a => a.TownDistrict).FirstOrDefault(),
                    PermPinNo = _context.Tbl_EmployeeAddresses.Where(a => a.EmployeeID == e.ID && a.AddressType == "Permanent").Select(a => a.PinNo).FirstOrDefault(),
                    PermCountryName = _context.Tbl_EmployeeAddresses.Include(a => a.Country).Where(a => a.EmployeeID == e.ID && a.AddressType == "Permanent").Select(a => a.Country.CountryName).FirstOrDefault(),
                    PermStateName = _context.Tbl_EmployeeAddresses.Include(a => a.State).Where(a => a.EmployeeID == e.ID && a.AddressType == "Permanent").Select(a => a.State.StateName).FirstOrDefault(),

                    // Statutory (Already working)
                    StatutoryDetails = _context.Tb_EmployeeStatutoryDetails
                        .Where(s => s.EmployeeID == e.ID && !s.IsDeleted)
                        .Select(s => new ViewStatutoryDetailsDto
                        {
                            AadhaarNumber = s.AadhaarNumber,
                            PANNumber = s.PANNumber,
                            PassportNumber = s.PassportNumber,
                            UANNo = s.UANNo,
                            PFNo = s.PFNo,
                            ESINo = s.ESINo
                        }).FirstOrDefault(),

                    // Bank (Already working)
                    BankDetails = _context.EmployeeBankDetails
                        .Where(b => b.EmployeeID == e.ID && !b.IsDeleted)
                        .Select(b => new ViewBankDetailsDto
                        {
                            AccountHolderName = b.AccountHolderName,
                            BankName = b.BankName,
                            AccountNumber = b.AccountNumber,
                            IFSCCode = b.IFSCCode,
                            SwiftCode = b.SwiftCode,
                            IBANNo = b.IBANNo,
                            SortCode = b.SortCode,
                            BankAddress = b.BankAddress
                        }).FirstOrDefault(),

                    // --- FIXED: Direct Query for Qualifications ---
                    Qualifications = _context.Tbl_EmployeeQualifications
                        .Where(q => q.EmployeeID == e.ID && !q.IsDeleted)
                        .Select(q => new QualificationResponseDto
                        {
                            Degree = q.Degree,
                            University = q.University,
                            PassingYear = q.PassingYear,
                            Percentage = q.Percentage
                        }).ToList(),

                    // --- FIXED: Direct Query for Experiences ---
                    Experiences = _context.Tbl_EmployeeExperiences
                        .Where(ex => ex.EmployeeID == e.ID && !ex.IsDeleted)
                        .Select(ex => new ExperienceResponseDto
                        {
                            CompanyName = ex.CompanyName,
                            Designation = ex.Designation,
                            FromDate = ex.FromDate,
                            ToDate = ex.ToDate,
                            Location = ex.Location
                        }).ToList(),

                    Documents = _context.Tb_EmployeeDocuments
                        .Where(d => d.EmployeeID == e.ID && !d.IsDeleted)
                        .Select(d => new ViewDocumentDto
                        {
                            Id = d.ID,
                            DocumentName = d.DocumentName,
                            FilePath = d.FilePath,
                            UploadedDate = d.UploadedDate
                        }).ToList(),

                    PFDetails = _context.EmployeePFDetails
                        .Where(p => p.EmployeeID == e.ID && !p.IsDeleted)
                        .Select(p => new ViewPFDetailsDto
                        {
                            PFDeductionPercentage = p.PFDeductionPercentage,
                            IsCappedAt15k = p.IsCappedAt15k
                        })
                        .FirstOrDefault(),
                })
                .FirstOrDefaultAsync();

            if (employeeDetails != null && !string.IsNullOrEmpty(employeeDetails.EmailAddress))
            {
                var user = await _userManager.FindByEmailAsync(employeeDetails.EmailAddress);

                if (user != null)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    employeeDetails.Role = roles.FirstOrDefault();
                }
            }

            return employeeDetails;
        }

        public async Task<EmployeeDetailDto> UpdateEmployeeAsync(int id, UpdateEmployeeDto updateDto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var emp = await _context.Employees
                    .Include(e => e.Addresses)
                    .FirstOrDefaultAsync(e => e.ID == id && e.IsDeleted == false);

                if (emp == null) return null;

                // 1. Basic Info
                emp.FirstName = updateDto.FirstName;
                emp.LastName = updateDto.LastName;
                emp.GoogleCalendarId = updateDto.GoogleCalendarId;
                emp.MiddleName = updateDto.MiddleName;
                emp.EmployeeCode = updateDto.EmployeeCode;
                if (!string.IsNullOrEmpty(updateDto.CurMobileNo))
                {
                    emp.MobileNumber = updateDto.CurMobileNo;
                }
                emp.CompanyId = updateDto.CompanyId;
                emp.Gender = updateDto.Gender;
                emp.DepartmentID = (updateDto.DepartmentID > 0) ? updateDto.DepartmentID : null;
                emp.DesignationID = (updateDto.DesignationID > 0) ? updateDto.DesignationID : null;
                emp.LevelID = updateDto.LevelID;
                emp.WorkLocationID = (updateDto.WorkLocationID > 0) ? updateDto.WorkLocationID : null;
                emp.IsActive = updateDto.IsActive;

                if (updateDto.DateOfBirth.HasValue)
                    emp.DateOfBirth = DateTime.SpecifyKind(updateDto.DateOfBirth.Value, DateTimeKind.Unspecified);

                var user = await _userManager.FindByEmailAsync(emp.EmailAddress);
                if (user != null && !string.IsNullOrEmpty(updateDto.Role))
                {
                    var currentRoles = await _userManager.GetRolesAsync(user);

                    if (!currentRoles.Contains(updateDto.Role))
                    {
                        await _userManager.RemoveFromRolesAsync(user, currentRoles);
                        await _userManager.AddToRoleAsync(user, updateDto.Role);
                    }
                }

                // 2. Photo
                if (updateDto.Photo != null)
                    emp.PhotoPath = await SaveEmployeePhoto(updateDto.Photo, emp.PhotoPath);

                // 3. Addresses (Current & Permanent)
                await UpdateAddress(id, "Current", updateDto.CurFlatNo, updateDto.CurPremisesName, updateDto.CurRoadName, updateDto.CurLocality, updateDto.CurTownDistrict, updateDto.CurPinNo, updateDto.CurCountryId, updateDto.CurStateId, updateDto.CurMobileNo, updateDto.CurEmail);
                await UpdateAddress(id, "Permanent", updateDto.PermFlatNo, updateDto.PermPremisesName, updateDto.PermRoadName, updateDto.PermLocality, updateDto.PermTownDistrict, updateDto.PermPinNo, updateDto.PermCountryId, updateDto.PermStateId, updateDto.PermMobileNo, updateDto.PermEmail);

                // 4. Bank Details
                var bank = await _context.EmployeeBankDetails.FirstOrDefaultAsync(b => b.EmployeeID == id);
                if (bank == null)
                {
                    bank = new EmployeeBankDetails { EmployeeID = id };
                    _context.EmployeeBankDetails.Add(bank);
                }
                bank.BankName = updateDto.BankName ?? "";
                bank.AccountNumber = updateDto.AccountNumber ?? "";
                bank.IFSCCode = updateDto.IFSCCode ?? "";
                bank.AccountHolderName = updateDto.AccountHolderName;
                bank.BankAddress = updateDto.BankAddress;
                bank.SortCode = updateDto.SortCode;
                bank.SwiftCode = updateDto.SwiftCode;
                bank.IBANNo = updateDto.IBANNo;

                // 5. Qualifications (Refresh list)
                var oldQuals = _context.Tbl_EmployeeQualifications.Where(q => q.EmployeeID == id);
                _context.Tbl_EmployeeQualifications.RemoveRange(oldQuals);
                if (!string.IsNullOrEmpty(updateDto.QualificationsJson))
                {
                    var quals = JsonConvert.DeserializeObject<List<QualificationSubDto>>(updateDto.QualificationsJson);
                    foreach (var q in quals)
                    {
                        _context.Tbl_EmployeeQualifications.Add(new EmployeeQualification
                        {
                            EmployeeID = id,
                            Degree = q.Degree,
                            University = q.University,
                            PassingYear = q.PassingYear,
                            Percentage = q.Percentage
                        });
                    }
                }

                // 6. Experience (Refresh list)
                var oldExps = _context.Tbl_EmployeeExperiences.Where(ex => ex.EmployeeID == id);
                _context.Tbl_EmployeeExperiences.RemoveRange(oldExps);
                if (!string.IsNullOrEmpty(updateDto.ExperiencesJson))
                {
                    var exps = JsonConvert.DeserializeObject<List<ExperienceSubDto>>(updateDto.ExperiencesJson);
                    foreach (var ex in exps)
                    {
                        _context.Tbl_EmployeeExperiences.Add(new EmployeeExperience
                        {
                            EmployeeID = id,
                            CompanyName = ex.CompanyName,
                            Designation = ex.Designation,
                            FromDate = ex.FromDate,
                            ToDate = ex.ToDate,
                            Location = ex.Location
                        });
                    }
                }

                var statutory = await _context.Tb_EmployeeStatutoryDetails
                .FirstOrDefaultAsync(s => s.EmployeeID == id && !s.IsDeleted);

                if (statutory == null)
                {
                    statutory = new EmployeeStatutoryDetails
                    {
                        EmployeeID = id
                    };

                    _context.Tb_EmployeeStatutoryDetails.Add(statutory);
                }

                statutory.PANNumber = updateDto.PANNumber;
                statutory.AadhaarNumber = updateDto.AadhaarNumber;
                statutory.PassportNumber = updateDto.PassportNumber;

                // 8. Payroll PF Details
                var pfDetails = await _context.EmployeePFDetails
                    .FirstOrDefaultAsync(p => p.EmployeeID == id && !p.IsDeleted);

                if (pfDetails == null)
                {
                    pfDetails = new EmployeePFDetails
                    {
                        EmployeeID = id
                    };

                    _context.EmployeePFDetails.Add(pfDetails);
                }

                pfDetails.PFDeductionPercentage =
                    updateDto.PFDeductionPercentage ?? 12;

                pfDetails.IsCappedAt15k =
                    updateDto.IsCappedAt15k;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return await GetEmployeeByIdAsync(id);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task UpdateAddress(int empId, string type, string? flat, string? premises, string? road, string? locality, string? town, string? pin, int? country, int? state, string? mobile, string? email)
        {
            var addr = await _context.Tbl_EmployeeAddresses.FirstOrDefaultAsync(a => a.EmployeeID == empId && a.AddressType == type);
            if (addr == null)
            {
                addr = new EmployeeAddress { EmployeeID = empId, AddressType = type };
                _context.Tbl_EmployeeAddresses.Add(addr);
            }
            addr.FlatNo = flat; addr.PremisesName = premises; addr.RoadName = road; addr.Locality = locality;
            addr.TownDistrict = town; addr.PinNo = pin; addr.CountryId = (country > 0 ? country : null);
            addr.StateId = (state > 0 ? state : null); addr.MobileNo = mobile; addr.Email = email;
        }

        public async Task<EmployeeDetailDto> GetEmployeeByCodeAsync(string employeeCode)
        {
            _logger.LogInformation("Fetching employee by Code: {EmployeeCode}", employeeCode);
            if (string.IsNullOrWhiteSpace(employeeCode))
                return null;

            var emp = await _context.Employees
                .Include(e => e.WorkLocation)
                .Include(e => e.Department)
                .Include(e => e.Designation)
                .Include(e => e.Level)
                .Include(e => e.ReportingToManager)
                .FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode && e.IsDeleted == false);

            if (emp == null)
            {
                _logger.LogWarning("Employee with Code: {EmployeeCode} not found or is inactive.", employeeCode);
                return null;
            }

            return new EmployeeDetailDto
            {
                ID = emp.ID,
                EmployeeCode = emp.EmployeeCode,
                FirstName = emp.FirstName,
                MiddleName = emp.MiddleName,
                LastName = emp.LastName,
                EmailAddress = emp.EmailAddress,
                MobileNumber = emp.MobileNumber,
                DateOfBirth = emp.DateOfBirth,
                DateOfJoining = emp.DateOfJoining,
                Gender = emp.Gender,
                WorkLocationID = emp.WorkLocationID,
                WorkLocationName = emp.WorkLocation?.LocationName,
                DepartmentID = emp.DepartmentID,
                DepartmentName = emp.Department?.DepartmentName,
                DesignationID = emp.DesignationID,
                DesignationName = emp.Designation?.DesignationName,
                LevelID = emp.LevelID,
                LevelName = emp.Level?.LevelName,
                ReportingTo = emp.ReportingTo,
                ReportingToName = emp.ReportingToManager != null ? $"{emp.ReportingToManager.FirstName} {emp.ReportingToManager.LastName}" : "N/A",
                IsActive = emp.IsActive,
                IsDeleted = emp.IsDeleted
            };
        }

        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            _logger.LogInformation("Attempting to soft delete employee with ID: {EmployeeId} and all related data.", id);

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var employeeToDelete = await _context.Employees
                    .Include(e => e.ApplicationUser) 
                    .FirstOrDefaultAsync(e => e.ID == id);

                if (employeeToDelete == null || employeeToDelete.IsDeleted)
                {
                    _logger.LogWarning("Soft delete failed. Employee with ID: {EmployeeId} not found or already deleted.", id);
                    await transaction.RollbackAsync();
                    return false;
                }

                employeeToDelete.IsActive = false;
                employeeToDelete.IsDeleted = true; 
                employeeToDelete.DateOfLeaving = DateTime.UtcNow;

                if (employeeToDelete.ApplicationUser != null)
                {
                    var user = await _userManager.FindByIdAsync(employeeToDelete.ApplicationUser.Id);
                    if (user != null)
                    {
                        await _userManager.SetLockoutEnabledAsync(user, true);
                        await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
                        _logger.LogInformation("Locked out ApplicationUser for EmployeeID: {EmployeeId}", id);
                    }
                }

                var bankDetails = await _context.EmployeeBankDetails
                    .Where(b => b.EmployeeID == id && !b.IsDeleted)
                    .ToListAsync();
                foreach (var detail in bankDetails)
                {
                    detail.IsDeleted = true;
                }
                _logger.LogInformation("Marked {Count} bank details as deleted for EmployeeID: {EmployeeId}", bankDetails.Count, id);

                var statutoryDetails = await _context.Tb_EmployeeStatutoryDetails
                    .Where(s => s.EmployeeID == id && !s.IsDeleted)
                    .ToListAsync();
                foreach (var detail in statutoryDetails)
                {
                    detail.IsDeleted = true;
                }
                _logger.LogInformation("Marked {Count} statutory details as deleted for EmployeeID: {EmployeeId}", statutoryDetails.Count, id);

                var documents = await _context.Tb_EmployeeDocuments
                    .Where(d => d.EmployeeID == id && !d.IsDeleted)
                    .ToListAsync();
                foreach (var doc in documents)
                {
                    doc.IsDeleted = true;
                }
                _logger.LogInformation("Marked {Count} documents as deleted for EmployeeID: {EmployeeId}", documents.Count, id);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                _logger.LogInformation("Successfully soft deleted employee with ID: {EmployeeId} and all related data.", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during the cascading soft delete for EmployeeID: {EmployeeId}. Rolling back transaction.", id);
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<IEnumerable<EmployeeSelectionDto>> GetEmployeeSelectionListAsync()
        {
            var employees = await _context.Employees
                .Include(e => e.WorkLocation)
                  .Include(e => e.Level)
                  .Include(e => e.Designation)
                .Where(e => e.IsActive == true && !e.IsDeleted)
                .Select(e => new {
                    Employee = e,
                    PFDetail = _context.EmployeePFDetails
                                       .Where(p => p.EmployeeID == e.ID && !p.IsDeleted)
                                       .FirstOrDefault(),

                    TDSDetail = _context.EmployeeTDSDetails
                                .Where(t => t.EmployeeID == e.ID && !t.IsDeleted)
                                .FirstOrDefault()
                })
                .ToListAsync();

            return employees.Select(e => new EmployeeSelectionDto
            {
                Id = e.Employee.ID,
                FullName = $"{e.Employee.FirstName} {e.Employee.MiddleName} {e.Employee.LastName} ({e.Employee.EmployeeCode})",
                FirstName = e.Employee.FirstName,
                LastName = e.Employee.LastName,
                EmployeeCode = e.Employee.EmployeeCode,
                Designation = e.Employee.Designation?.DesignationName,
                Gender = e.Employee.Gender,
                PFDeductionPercentage = e.PFDetail?.PFDeductionPercentage ?? 12.0m,
                State = e.Employee.WorkLocation?.State,
                IsCappedAt15k = e.PFDetail?.IsCappedAt15k ?? false,
                TDSAmount = e.TDSDetail?.TDSAmount ?? 0m,

                LevelID = e.Employee.LevelID,
                LevelName = e.Employee.Level != null ? e.Employee.Level.LevelName : null,
                LevelOrder = e.Employee.Level != null ? e.Employee.Level.LevelOrder : null
            })
            .OrderBy(e => e.FullName)
            .ToList();
        }

        public async Task<IEnumerable<EmployeeSelectionDto>> GetEmployeesByRoleAsync(string role)
        {
            var usersInRole = await _userManager.GetUsersInRoleAsync(role);

            var employeeIds = usersInRole
                .Where(u => u.EmployeeId > 0)
                .Select(u => u.EmployeeId)
                .ToList();

            var rawEmployees = await _context.Employees
                .Where(e => employeeIds.Contains(e.ID) && e.IsActive && !e.IsDeleted)
                .Select(e => new
                {
                    e.ID,
                    e.FirstName,
                    e.MiddleName,
                    e.LastName,
                    e.EmployeeCode
                })
                .ToListAsync(); 

            return rawEmployees
                .Select(e => new EmployeeSelectionDto
                {
                    Id = e.ID,
                    FullName = $"{e.FirstName} {e.MiddleName} {e.LastName} ({e.EmployeeCode})"
                })
                .OrderBy(e => e.FullName)
                .ToList();
        }

        public async Task<IEnumerable<EmployeeSelectionDto>> GetEmployeesByRoleAndDepartmentAsync(string role, int departmentId)
        {
            _logger.LogInformation("Fetching employees with Role '{Role}' in DepartmentID '{DepartmentId}'", role, departmentId);

            var usersInRole = await _userManager.GetUsersInRoleAsync(role);

            if (!usersInRole.Any())
            {
                _logger.LogWarning("No users found with the role '{Role}'", role);
                return new List<EmployeeSelectionDto>();
            }

            var employeeIdsInRole = usersInRole
                .Where(u => u.EmployeeId > 0)
                .Select(u => u.EmployeeId)
                .ToList();

            var employeesFromDb = await _context.Employees
                .Where(e => employeeIdsInRole.Contains(e.ID) &&
                            e.DepartmentID == departmentId &&
                            e.IsActive && !e.IsDeleted)
                .Select(e => new
                {
                    e.ID,
                    e.FirstName,
                    e.MiddleName,
                    e.LastName,
                    e.EmployeeCode
                })
                .ToListAsync();

            var employees = employeesFromDb
                .Select(e => new EmployeeSelectionDto
                {
                    Id = e.ID,
                    FullName = $"{e.FirstName} {e.MiddleName} {e.LastName} ({e.EmployeeCode})"
                })
                .OrderBy(e => e.FullName) 
                .ToList();

            _logger.LogInformation("Found {Count} employees matching the criteria.", employees.Count);

            return employees;
        }

        private async Task<string> SaveEmployeePhoto(IFormFile photo, string? oldPath = null)
        {
            if (photo == null || photo.Length == 0) return oldPath;

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Uploads", "Employees");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            // Delete old photo if it exists to save space
            if (!string.IsNullOrEmpty(oldPath))
            {
                var oldFullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", oldPath.TrimStart('/'));
                if (File.Exists(oldFullPath)) File.Delete(oldFullPath);
            }

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(photo.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await photo.CopyToAsync(stream);
            }

            return "/Uploads/Employees/" + fileName;
        }

        public async Task<bool> UpdateEmployeeStatusAsync(int id, bool isActive)
        {
            var emp = await _context.Employees.FirstOrDefaultAsync(e => e.ID == id && !e.IsDeleted);
            if (emp == null) return false;

            emp.IsActive = isActive;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetEmployeeReportingAsync(SetReportingDto dto)
        {
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.ID == dto.EmployeeId && !e.IsDeleted);

            if (employee == null)
                return false;

            employee.ReportingTo = dto.ReportingToId;

            await _context.SaveChangesAsync();

            return true;
        }

    }
}