using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using CompanyPlatform.Core.DTO;
using CompanyPlatform.Core.DTO.AccessControl;
using CompanyPlatform.Core.Hubs;
using CompanyPlatform.Core.Models;
using CompanyPlatform.Core.Services.AccessControl;
using CompanyPlatform.Core.Services.Notification;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Services.Email;
using CompanyPlatform.Core.Models.CRM.Employee;
using Newtonsoft.Json;

namespace CompanyPlatform.Core.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDBContext _dbContext;
        private readonly ILogger<AuthService> _logger;
        private readonly IEmailService _emailService;
        private readonly IAccessControlService _accessControlService;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IUserConnectionService _userConnectionService;
        private readonly INotificationService _notificationService;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            ApplicationDBContext dbContext,
            ILogger<AuthService> logger,
            IEmailService emailService,
            IAccessControlService accessControlService,
            IHubContext<NotificationHub> hubContext,
            IUserConnectionService userConnectionService,
            INotificationService notificationService
            )
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _dbContext = dbContext;
            _logger = logger;
            _emailService = emailService;
            _accessControlService = accessControlService;
            _hubContext = hubContext;
            _userConnectionService = userConnectionService;
            _notificationService = notificationService;
        }

        public async Task<(IdentityResult, string)> RegisterEmployeeAsync(RegisterEmployeeDto registerDto)
        {
            // 1. Initial Validations
            //var emailExists = await _userManager.FindByEmailAsync(registerDto.Email);
            //if (emailExists != null) return (IdentityResult.Failed(), "Email already exists.");


            // Only block if active (not soft-deleted) employee has this email
            var activeEmployee = await _dbContext.Employees
                .AnyAsync(e => e.EmailAddress == registerDto.Email && !e.IsDeleted);
            if (activeEmployee)
                return (IdentityResult.Failed(), "An active employee with this email already exists.");

            //var codeExists = await _dbContext.Employees.AnyAsync(e => e.EmployeeCode == registerDto.EmployeeCode);
            //if (codeExists) return (IdentityResult.Failed(), "Employee code already exists.");

            //await using var transaction = await _dbContext.Database.BeginTransactionAsync();

            // If a soft-deleted employee exists with this email, remove its Identity user
            var deletedEmployee = await _dbContext.Employees
        .FirstOrDefaultAsync(e => e.EmailAddress == registerDto.Email && e.IsDeleted);
            if (deletedEmployee != null)
            {
                var existingIdentityUser = await _userManager.FindByEmailAsync(registerDto.Email);
                if (existingIdentityUser != null)
                {
                    await _userManager.DeleteAsync(existingIdentityUser);
                }
            }

            // --- 4. Begin transaction and continue with original logic ---
            await using var transaction = await _dbContext.Database.BeginTransactionAsync();

            try
            {
                // 2. Handle Photo Upload Logic
                string photoPath = null;
                if (registerDto.Photo != null && registerDto.Photo.Length > 0)
                {
                    var fileName = Guid.NewGuid() + Path.GetExtension(registerDto.Photo.FileName);
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/Uploads/Employees");
                    if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                    var filePath = Path.Combine(uploadsFolder, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create)) { await registerDto.Photo.CopyToAsync(stream); }
                    photoPath = "/Uploads/Employees/" + fileName;
                }

                // 3. Save Main Employee Record
                var newEmployee = new Employees
                {
                    EmployeeCode = registerDto.EmployeeCode,
                    FirstName = registerDto.FirstName,
                    MiddleName = registerDto.MiddleName,
                    LastName = registerDto.LastName,
                    EmailAddress = registerDto.Email,
                    MobileNumber = registerDto.CurMobileNo ?? "",
                    CompanyId = registerDto.CompanyId,
                    DepartmentID = registerDto.DepartmentID,
                    DesignationID = registerDto.DesignationID,
                    LevelID = registerDto.LevelID,
                    PhotoPath = photoPath,
                    // Use provided values or defaults for Payroll compatibility
                    DateOfBirth = registerDto.DateOfBirth ?? DateTime.MinValue,
                    DateOfJoining = registerDto.DateOfJoining ?? DateTime.Now,
                    WorkLocationID = registerDto.WorkLocationID,
                    IsActive = true,
                    IsDeleted = false
                };
                _dbContext.Employees.Add(newEmployee);
                await _dbContext.SaveChangesAsync();

                // 4. Save Statutory Details
                var statutory = new EmployeeStatutoryDetails
                {
                    EmployeeID = newEmployee.ID,
                    PANNumber = registerDto.PANNumber,
                    PassportNumber = registerDto.PassportNumber,
                    AadhaarNumber = registerDto.AadhaarNumber,
                    UANNo = registerDto.UANNo,
                    PFNo = registerDto.PFNo,
                    ESINo = registerDto.ESINo
                };
                _dbContext.Tb_EmployeeStatutoryDetails.Add(statutory);

                // 5. Save Addresses (Current & Permanent)
                var addresses = new List<EmployeeAddress>
        {
            new EmployeeAddress {
                EmployeeID = newEmployee.ID, AddressType = "Current",
                FlatNo = registerDto.CurFlatNo, PremisesName = registerDto.CurPremisesName,
                RoadName = registerDto.CurRoadName, Locality = registerDto.CurLocality,
                TownDistrict = registerDto.CurTownDistrict, PinNo = registerDto.CurPinNo,
                CountryId = registerDto.CurCountryId, StateId = registerDto.CurStateId,
                MobileNo = registerDto.CurMobileNo, Email = registerDto.CurEmail
            },
            new EmployeeAddress {
                EmployeeID = newEmployee.ID, AddressType = "Permanent",
                FlatNo = registerDto.PermFlatNo, PremisesName = registerDto.PermPremisesName,
                RoadName = registerDto.PermRoadName, Locality = registerDto.PermLocality,
                TownDistrict = registerDto.PermTownDistrict, PinNo = registerDto.PermPinNo,
                CountryId = registerDto.PermCountryId, StateId = registerDto.PermStateId,
                MobileNo = registerDto.PermMobileNo, Email = registerDto.PermEmail
            }
        };
                _dbContext.Set<EmployeeAddress>().AddRange(addresses);

                // 6. Save Bank Details
                var bank = new EmployeeBankDetails
                {
                    EmployeeID = newEmployee.ID,
                    BankName = registerDto.BankName ?? "",
                    BankAddress = registerDto.BankAddress,
                    AccountNumber = registerDto.AccountNumber ?? "",
                    IFSCCode = registerDto.IFSCCode ?? "",
                    AccountHolderName = registerDto.AccountHolderName ?? $"{newEmployee.FirstName} {newEmployee.LastName}",
                    SortCode = registerDto.SortCode,
                    SwiftCode = registerDto.SwiftCode,
                    IBANNo = registerDto.IBANNo
                };
                _dbContext.EmployeeBankDetails.Add(bank);

                // 7. Handle "Docs Attachments"
                if (registerDto.Attachments != null)
                {
                    foreach (var file in registerDto.Attachments)
                    {
                        var fName = Guid.NewGuid() + Path.GetExtension(file.FileName);
                        var fPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/Uploads/Documents", fName);
                        if (!Directory.Exists(Path.GetDirectoryName(fPath))) Directory.CreateDirectory(Path.GetDirectoryName(fPath));
                        using (var stream = new FileStream(fPath, FileMode.Create)) { await file.CopyToAsync(stream); }

                        _dbContext.Tb_EmployeeDocuments.Add(new EmployeeDocument
                        {
                            EmployeeID = newEmployee.ID,
                            DocumentName = file.FileName,
                            FilePath = "/Uploads/Documents/" + fName,
                            UploadedDate = DateTime.Now
                        });
                    }
                }

                try
                {
                    // 1. Save Qualifications
                    if (!string.IsNullOrEmpty(registerDto.QualificationsJson))
                    {
                        var qualifications = JsonConvert.DeserializeObject<List<QualificationSubDto>>(registerDto.QualificationsJson);
                        foreach (var q in qualifications)
                        {
                            _dbContext.Tbl_EmployeeQualifications.Add(new EmployeeQualification
                            {
                                EmployeeID = newEmployee.ID,
                                Degree = q.Degree,
                                University = q.University,
                                PassingYear = q.PassingYear,
                                Percentage = q.Percentage
                            });
                        }
                    }

                    // 2. Save Experience
                    if (!string.IsNullOrEmpty(registerDto.ExperiencesJson))
                    {
                        var experiences = JsonConvert.DeserializeObject<List<ExperienceSubDto>>(registerDto.ExperiencesJson);
                        foreach (var ex in experiences)
                        {
                            _dbContext.Tbl_EmployeeExperiences.Add(new EmployeeExperience
                            {
                                EmployeeID = newEmployee.ID,
                                CompanyName = ex.CompanyName,
                                Designation = ex.Designation,
                                FromDate = ex.FromDate,
                                ToDate = ex.ToDate,
                                Location = ex.Location
                            });
                        }
                    }

                    await _dbContext.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError("Error saving Qual/Exp: " + ex.Message);
                    // You can choose to rollback or continue depending on requirements
                }

                // --- THE MISSING CALL: ASSIGN INITIAL LEAVES ---
                // This ensures the employee has a leave balance in the system immediately
                await AssignInitialLeavesAsync(newEmployee.ID);

                // 8. Identity User Creation
                var newUser = new ApplicationUser { UserName = registerDto.Email, Email = registerDto.Email, EmployeeId = newEmployee.ID };
                var result = await _userManager.CreateAsync(newUser, registerDto.Password);

                if (!result.Succeeded)
                {
                    await transaction.RollbackAsync();
                    return (result, result.Errors.First().Description);
                }

                await _userManager.AddToRoleAsync(newUser, registerDto.Role ?? "Employee");

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();

                return (IdentityResult.Success, "Employee registered successfully!");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return (IdentityResult.Failed(), $"Registration failed: {ex.Message}");
            }
        }

        private async Task AssignInitialLeavesAsync(int employeeId)
        {
            // Helper to determine the financial year. A financial year in India starts on April 1st.
            int GetFinancialYearForDate(DateTime date)
            {
                return date.Month >= 4 ? date.Year : date.Year - 1;
            }

            int currentFinancialYear = GetFinancialYearForDate(DateTime.Now);

            _logger.LogInformation("Attempting to assign initial leaves for new EmployeeID: {EmployeeID} for Financial Year: {FinancialYear}", employeeId, currentFinancialYear);

            // Find the standard leave allocations for the current financial year by looking at what other employees have.
            // We group by LeaveTypeID to get a distinct list of leave policies for the year.
            var yearLeaveTemplates = await _dbContext.Tb_AssignLeaveTypes
                .Where(a => a.FinancialYear == currentFinancialYear && !a.IsDeleted)
                .GroupBy(a => a.LeaveTypeID)
                .Select(g => new
                {
                    LeaveTypeID = g.Key,
                    // We assume AllocatedDays is the same for a given LeaveTypeID within the same year for all employees.
                    AllocatedDays = g.FirstOrDefault().AllocatedDays
                })
                .ToListAsync();

            if (!yearLeaveTemplates.Any())
            {
                _logger.LogWarning("No existing leave allocations found for the current financial year {FinancialYear}. New employee {EmployeeID} will not be assigned any leaves automatically.", currentFinancialYear, employeeId);
                return; // No templates to assign from, so we exit.
            }

            var newAllocations = new List<AssignLeaveType>();

            foreach (var template in yearLeaveTemplates)
            {
                newAllocations.Add(new AssignLeaveType
                {
                    EmployeeID = employeeId,
                    LeaveTypeID = template.LeaveTypeID,
                    AllocatedDays = template.AllocatedDays,
                    FinancialYear = currentFinancialYear,
                    IsDeleted = false
                });
            }

            if (newAllocations.Any())
            {
                await _dbContext.Tb_AssignLeaveTypes.AddRangeAsync(newAllocations);
                await _dbContext.SaveChangesAsync();
                _logger.LogInformation("Successfully assigned {Count} leave types to new EmployeeID: {EmployeeID} for FY {FinancialYear}.", newAllocations.Count, employeeId, currentFinancialYear);
            }
        }
        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto loginDto)
        {
            var user = await _dbContext.Users
              .FirstOrDefaultAsync(u => u.Email == loginDto.Email || u.Employee.EmailAddress == loginDto.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
            {
                _logger.LogWarning("Failed login attempt for user: {Email}. Reason: Invalid email or password.", loginDto.Email);
                return null;
            }

            var employee = await _dbContext.Employees
                .FirstOrDefaultAsync(e => e.ID == user.EmployeeId && e.IsActive == true);
            if (employee == null)
            {
                _logger.LogWarning("Failed login for user: {Email}. Reason: User is authenticated but employee record is inactive or not found.", loginDto.Email);
                return null;
            }

            var userRoles = await _userManager.GetRolesAsync(user);
            var role = userRoles.FirstOrDefault() ?? "Employee";

            var permissions = new List<AccessControlDto>();
            if (role != "Admin" && !string.IsNullOrEmpty(role))
            {
                var roleObject = await _roleManager.FindByNameAsync(role);
                if (roleObject != null)
                {
                    permissions = await _accessControlService.GetAllPermissionsByRoleAsync(roleObject.Id);
                }
            }

            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("EmployeeId", user.EmployeeId.ToString()),
                new Claim("WorkLocationID", employee.WorkLocationID.ToString()),
                new Claim("DepartmentID", employee.DepartmentID.ToString()),
                new Claim("DesignationID", employee.DesignationID.ToString()),
                new Claim("FirstName",employee.FirstName),
                new Claim("LastName",employee.LastName),
                new Claim("IsActive", employee.IsActive.ToString()),
                new Claim("IsDeleted",employee.IsDeleted.ToString())
            };

            foreach (var userRole in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, userRole));
            }

            var token = CreateToken(authClaims);


            _logger.LogInformation("User {Email} logged in successfully.", loginDto.Email);

            return new LoginResponseDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Expiration = token.ValidTo,
                Email = user.Email,
                Role = role,
                WorkLocationID = employee.WorkLocationID,
                DepartmentID = employee.DepartmentID,
                DesignationID = employee.DesignationID,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                IsActive = employee.IsActive,
                IsDeleted = employee.IsDeleted,
                EmployeeId=employee.ID,
                DateOfJoining = employee.DateOfJoining,
                PhotoPath = employee.PhotoPath, 
                CompanyName = employee.Company?.CompanyName,
                GoogleCalendarId = employee.GoogleCalendarId,
                Permissions = permissions
            };
        }

        private JwtSecurityToken CreateToken(List<Claim> authClaims)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var expirationTime = DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpirationMinutes"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: expirationTime,
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );
            return token;
        }

        public async Task<string> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
        {
            _logger.LogInformation("ForgotPasswordAsync triggered for {Email}", forgotPasswordDto.Email);
            //var user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);
            var user = await _dbContext.Users
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u =>
                u.Email == forgotPasswordDto.Email ||
                u.Employee.EmailAddress == forgotPasswordDto.Email);

            if (user == null)
            {
                _logger.LogWarning("Forgot password attempt for non-existent email: {Email}", forgotPasswordDto.Email);
                return "If an account with this email exists, a password reset link has been sent.";
            }

            var emailToSend = user.Employee?.EmailAddress ?? user.Email;

            if (string.IsNullOrWhiteSpace(emailToSend))
            {
                _logger.LogError("No email found for reset password. UserId={UserId}", user.Id);
                return "If an account with this email exists, a password reset link has been sent.";
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            //var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var encodedToken = Uri.EscapeDataString(token);

            var clientAppUrl = _configuration["AppSettings:ClientAppUrl"];
            //var resetLink = $"{clientAppUrl}/reset-password?email={Uri.EscapeDataString(user.Email)}&token={Uri.EscapeDataString(encodedToken)}";
                var resetLink =
           $"{clientAppUrl}/reset-password" +
           $"?email={Uri.EscapeDataString(emailToSend)}" +
           $"&token={encodedToken}";
            var logoUrl = "https://eminenceequipments.com/wp-content/uploads/2025/08/Untitled_design__15_-removebg-preview.png";

        var userName = user.Employee?.FirstName ?? user.UserName; 
        var teamName = "The PayrollPro Team"; 
        var year = DateTime.Now.Year;

        var emailBody = $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }}
        .container {{ max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #dddddd; }}
        .content {{ padding: 20px 40px; }}
        .header {{ text-align: center; padding: 20px 0; }}
        .header img {{ max-width: 150px; }}
        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #999999; }}
        h1 {{ color: #333333; font-size: 24px; }}
        p {{ color: #555555; font-size: 16px; line-height: 1.5; }}
        .button {{
            display: inline-block;
            background-color: #007bff;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <table width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""background-color:#f4f4f4;"">
        <tr>
            <td align=""center"">
                <table class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""background-color:#ffffff; border:1px solid #dddddd;"">
                    <!-- Header with Logo -->
                    <tr>
                        <td class=""header"" style=""text-align:center; padding:20px 0;"">
                            <img src=""{logoUrl}"" alt=""{teamName} Logo"" style=""max-width:90px;"">
                        </td>
                    </tr>
                    <!-- Main Content -->
                    <tr>
                        <td class=""content"" style=""padding:20px 40px;"">
                            <h1 style=""color:#333333; font-size:24px;"">Password Reset Request</h1>
                            <p style=""color:#555555; font-size:16px; line-height:1.5;"">Hello {userName},</p>
                            <p style=""color:#555555; font-size:16px; line-height:1.5;"">We received a request to reset your password. Click the button below to choose a new one. If you did not make this request, you can safely ignore this email.</p>
                            <p style=""text-align:center; margin:30px 0;"">
                                <a href=""{resetLink}"" class=""button"" style=""display:inline-block; background-color:#007bff; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:5px; font-weight:bold;"">Reset Your Password</a>
                            </p>
                            <p style=""color:#555555; font-size:16px; line-height:1.5;"">This password reset link will expire in 24 hours.</p>
                            <p style=""color:#555555; font-size:16px; line-height:1.5;"">Thank you,<br>The {teamName}</p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td class=""footer"" style=""text-align:center; padding:20px; font-size:12px; color:#999999; border-top:1px solid #dddddd;"">
                            &copy; {year} {teamName}. All rights reserved.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
";
            //await _emailService.SendEmailAsync(user.Email, "Reset Your Password", emailBody);

            await _emailService.SendEmailAsync(
           emailToSend,
           "Reset Your Password",
           emailBody);

            _logger.LogInformation("Password reset link sent to {Email}", emailToSend);
            return "If an account with this email exists, a password reset link has been sent.";
        }

        public async Task<(IdentityResult, string)> ResetPasswordAsync(
       ResetPasswordDto resetPasswordDto)
        {
            _logger.LogInformation(
                "ResetPasswordAsync triggered for {Email}",
                resetPasswordDto.Email);

            var user = await _dbContext.Users
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u =>
                    u.Email == resetPasswordDto.Email ||
                    u.Employee.EmailAddress == resetPasswordDto.Email);

            if (user == null)
            {
                _logger.LogWarning("Password reset attempt for a non-existent email: {Email}", resetPasswordDto.Email);
                return (IdentityResult.Failed(), "Invalid reset attempt.");
            }

          
            var result = await _userManager.ResetPasswordAsync(
                user,
                resetPasswordDto.Token,
                resetPasswordDto.NewPassword);

            if (!result.Succeeded)
            {
                var error =
                    result.Errors.FirstOrDefault()?.Description ??
                    "Password reset failed.";

                _logger.LogWarning("Password reset failed for user {Email}. Reason: {Error}", resetPasswordDto.Email, error);
                return (result, error);
            }

            var employeeMessage =
                "Your password was successfully reset. If you did not make this change, contact support immediately.";

            await _notificationService.CreateNotificationAsync(
                user.EmployeeId,
                employeeMessage);

           

            return (IdentityResult.Success, "Password has been reset successfully.");
        }




        public async Task<(IdentityResult, string)> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("Change password attempt for a non-existent user ID: {UserId}", userId);
                return (IdentityResult.Failed(), "Invalid request.");
            }

            var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.OldPassword, changePasswordDto.NewPassword);

            if (!result.Succeeded)
            {
                string firstError = result.Errors.FirstOrDefault()?.Description ?? "Password change failed.";
                _logger.LogWarning("Password change failed for user {Email}. Reason: {Error}", user.Email, firstError);
                return (result, firstError);
            }

            _logger.LogInformation(
            "Password changed successfully for user {Email}",
            user.Email);

            
            if (user.EmployeeId <= 0)
            {
                _logger.LogWarning(
                    "Password changed but no valid EmployeeId found for user {UserId}",
                    user.Id);

                return (result, "Password changed successfully!");
            }

            var employeeMessage = "Your password was successfully changed from a logged-in session. If you did not make this change, please secure your account immediately.";
            await _notificationService.CreateNotificationAsync(user.EmployeeId, employeeMessage);
            var userConnectionId = _userConnectionService.GetUserConnection(user.EmployeeId);
            if (!string.IsNullOrEmpty(userConnectionId))
            {
                await _hubContext.Clients.Client(userConnectionId).SendAsync("ReceiveNotification", employeeMessage);
            }

            var employee = await _dbContext.Employees.FindAsync(user.EmployeeId);
            if (employee?.ReportingTo != null)
            {
                var managerId = employee.ReportingTo.Value;

                var managerMessage =
                    $"Security Alert: The password for employee " +
                    $"'{employee.FirstName} {employee.LastName} " +
                    $"({employee.EmployeeCode})' was changed from within their active session.";

                await _notificationService.CreateNotificationAsync(
                    managerId,
                    managerMessage);

                var managerConnectionId =
                    _userConnectionService.GetUserConnection(managerId);

                if (!string.IsNullOrEmpty(managerConnectionId))
                {
                    await _hubContext.Clients
                        .Client(managerConnectionId)
                        .SendAsync("ReceiveNotification", managerMessage);
                }
            }

            return (result, "Password changed successfully!");
        }
    }
}