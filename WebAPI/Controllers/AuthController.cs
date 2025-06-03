using Application.DTOs.Request;
using Application.Interfaces;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PreSchoolBE.src.Application.DTOs.Request;

namespace PreSchoolBE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest registerDto)
        {
            try
            {
                var result = await _authService.RegisterAsync(registerDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest loginDto)
        {
            try
            {
                var token = "Bearer " + await _authService.LoginAsync(loginDto);
                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("confirm")]
        public async Task<IActionResult> ConfirmEmail(string token)
        {
            try
            {
                await _authService.ConfirmEmailAsync(token);
                return Ok("Account activated successfully!");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("resend-confirmation-email")]
        public async Task<IActionResult> ReSendConfirmAccountEmail(string email)
        {
            try
            {
                var result = await _authService.ReSendConfirmAccountEmailAsync(email);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            bool emailSent = await _authService.ForgotPasswordAsync(request.Email!);
            if (!emailSent)
            {
                return BadRequest("Email not found or failed to send reset email");
            }
            return Ok("Reset email sent successfully");
        }

        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest("Token and new password are required");
            }

            try
            {
                bool result = await _authService.ResetPasswordAsync(request.Token, request.NewPassword);
                if (!result)
                {
                    return BadRequest("Invalid or expired token");
                }
                return Ok("Password reset successfully");
            }
            catch (SecurityTokenExpiredException)
            {
                return BadRequest("The reset password link has expired. Please request a new one.");
            }
            catch (Exception ex)
            {
                return BadRequest($"An error occurred: {ex.Message}");
            }
        }
        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                await _authService.ChangePasswordAsync(request);
                return Ok("Change password successfully");
            }
            catch (Exception)
            {
                return Unauthorized("Change password unsuccessfully");
            }
        }
    }
}