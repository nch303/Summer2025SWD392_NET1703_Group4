using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
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
                var token = await _authService.LoginAsync(loginDto);
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
    }
}