using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PayrollManagementAPI.DTO;
using CompanyPlatform.Core.Services.Auth;
using System.Security.Claims;
using CompanyPlatform.Core.DTO;

namespace CompanyPlatform.Core.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterEmployee([FromForm] RegisterEmployeeDto registerDto)
        {
            _logger.LogInformation("Registration attempt for email: {Email}", registerDto.Email);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (result, message) = await _authService.RegisterEmployeeAsync(registerDto);

            if (result.Succeeded)
            {
                return Ok(new { message });
            }

            _logger.LogWarning("Registration failed for user {Email}: {Message}", registerDto.Email, message);

            if (message.Contains("already exists"))
            {
                return Conflict(new { message });
            }

            return BadRequest(new { message });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
        {
            _logger.LogInformation("Login attempt for user: {Email}", loginDto.Email);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var loginResponse = await _authService.LoginAsync(loginDto);

            if (loginResponse == null)
            {
                _logger.LogWarning("Failed login attempt for user: {Email}", loginDto.Email);
                return Unauthorized(new { message = "Invalid email or password." });
            }

            return Ok(loginResponse);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            _logger.LogInformation("Forgot password request for email: {Email}", forgotPasswordDto.Email);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var message = await _authService.ForgotPasswordAsync(forgotPasswordDto);
            return Ok(new { message });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            _logger.LogInformation("Reset password attempt for email: {Email}", resetPasswordDto.Email);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (result, message) = await _authService.ResetPasswordAsync(resetPasswordDto);

            if (result.Succeeded)
            {
                return Ok(new { message });
            }

            return BadRequest(new { message });
        }

        [HttpPost("change-password")]
        [Authorize] 
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User is not authenticated." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (result, message) = await _authService.ChangePasswordAsync(userId, changePasswordDto);

            if (result.Succeeded)
            {
                return Ok(new { message });
            }

            return BadRequest(new { message });
        }
    }
}