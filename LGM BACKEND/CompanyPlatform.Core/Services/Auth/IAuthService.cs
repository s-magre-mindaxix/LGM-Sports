using Microsoft.AspNetCore.Identity;
using CompanyPlatform.Core.DTO;

namespace CompanyPlatform.Core.Services.Auth
{
    public interface IAuthService
    {
        Task<(IdentityResult, string)> RegisterEmployeeAsync(RegisterEmployeeDto registerDto);
        Task<LoginResponseDto> LoginAsync(LoginRequestDto loginDto);
        Task<string> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto); 
        Task<(IdentityResult, string)> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
        Task<(IdentityResult, string)> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
    }
}

