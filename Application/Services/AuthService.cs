using Application.DTOs.Request;
using Application.Interfaces;
using Application.Interfaces.IServices;
using BCrypt.Net;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PreSchoolBE.src.Application.DTOs.Request;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Application.Services.AuthService
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly IAuthRepository _authRepository;
        private readonly IAccountService _accountService;
        private readonly IAccountRepository _accountRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuthService(IConfiguration configuration, IAuthRepository authRepository, IEmailService emailService, IAccountService accountService, IAccountRepository accountRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _emailService = emailService;
            _authRepository = authRepository;
            _accountService = accountService;
            _accountRepository = accountRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<string> RegisterAsync(RegisterRequest registerDto)
        {
            // Check if the email is valid
            if (!IsValidEmail(registerDto.Email))
            {
                throw new Exception("Invalid email format.");
            }

            // CHeck if the password is valid
            if (!IsValidPassword(registerDto.Password))
            {
                throw new Exception("Password must have at least 8 characters, including a special character, a number, an uppercase letter, and a lowercase letter.");
            }

            // Check if the phone number is valid
            if (!IsValidPhoneNumber(registerDto.PhoneNumber))
            {
                throw new Exception("Invalid phone number format. It should start with 0 or +84 and have 10 digits.");
            }

            var existedAccount = await _accountService.GetAccountByEmailAsync(registerDto.Email);
            if (existedAccount != null)
                throw new Exception("Email already exists.");

            // Create a confirmation token
            var confirmationToken = Guid.NewGuid().ToString();

            // Send confirmation email
            var confirmationLink = $"http://localhost:3000/confirm?token={confirmationToken}";

            // Create the parent account
            var account = new Account
            {
                FullName = registerDto.FullName,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Email = registerDto.Email,
                PhoneNumber = registerDto.PhoneNumber,
                RoleId = 2, // Assuming 2 is the default role ID for parents
                Status = "Inactive",
                ConfirmationToken = confirmationToken
            };

            // Register the parent account
            await _authRepository.RegisterAsync(account);


            var emailBody = $@"<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Account Activation</title>
</head>
<body style=""font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 40px 0;"">
    <table width=""100%"" bgcolor=""#f4f7fa"" cellpadding=""0"" cellspacing=""0"">
        <tr>
            <td align=""center"">
                <table width=""600"" bgcolor=""#ffffff"" cellpadding=""0"" cellspacing=""0"" style=""border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;"">
                    <!-- Header -->
                    <tr>
                        <td bgcolor=""#FF9AA2"" style=""padding: 30px 20px; text-align: center;"">
                            <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td style=""text-align: center;"">
                                        <img src=""https://img.icons8.com/doodle/96/000000/abc.png"" alt=""School Logo"" style=""width: 70px; margin-bottom: 15px;"" />
                                        <h1 style=""color: #6C4675; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 1px 1px 2px rgba(255,255,255,0.3);"">Trường Mẫu Giáo Little Stars!</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style=""padding: 40px 30px; text-align: center; background: linear-gradient(to bottom, #ffffff, #fafafa);"">
                            
                            <h2 style=""color: #6C4675; font-size: 24px; margin-bottom: 20px;"">Kích hoạt tài khoản của bạn</h2>
                            
                            <div style=""background-color: #FFF9F0; border-left: 4px solid #FFB347; padding: 20px; border-radius: 8px; text-align: left; margin-bottom: 25px;"">
                                <p style=""color: #555; font-size: 16px; line-height: 1.6; margin: 0;"">
                                    Cảm ơn bạn đã đăng ký tài khoản tại <strong style=""color: #FF85A2;"">Trường Mẫu Giáo Little Stars</strong>! <br><br>
                                    Vui lòng nhấp vào nút bên dưới để kích hoạt tài khoản và bắt đầu hành trình cùng chúng tôi.
                                </p>
                            </div>
                            
                            <a href=""{confirmationLink}"" style=""display: inline-block; background: linear-gradient(135deg, #FF85A2, #FF4D6D); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: bold; margin-top: 10px; box-shadow: 0 4px 15px rgba(255, 77, 109, 0.4); transition: all 0.3s;"">
                                Kích hoạt tài khoản
                            </a>
                        </td>
                    </tr>
                    <!-- Features -->
                    <tr>
                        <td style=""padding: 0 30px 30px 30px; background-color: #fafafa;"">
                            <table width=""100%"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td style=""padding: 10px; text-align: center; width: 33%;"">
                                        <img src=""https://img.icons8.com/doodle/48/000000/teacher.png"" alt=""Quality Teachers"" style=""width: 48px;"" />
                                        <p style=""color: #6C4675; font-size: 14px; font-weight: bold; margin: 10px 0 0;"">Giáo viên chất lượng</p>
                                    </td>
                                    <td style=""padding: 10px; text-align: center; width: 33%;"">
                                        <img src=""https://img.icons8.com/doodle/48/000000/school.png"" alt=""Safe Environment"" style=""width: 48px;"" />
                                        <p style=""color: #6C4675; font-size: 14px; font-weight: bold; margin: 10px 0 0;"">Môi trường an toàn</p>
                                    </td>
                                    <td style=""padding: 10px; text-align: center; width: 33%;"">
                                        <img src=""https://img.icons8.com/doodle/48/000000/baby.png"" alt=""Child Development"" style=""width: 48px;"" />
                                        <p style=""color: #6C4675; font-size: 14px; font-weight: bold; margin: 10px 0 0;"">Phát triển toàn diện</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td bgcolor=""#E0F7FA"" style=""padding: 30px; text-align: center; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;"">
                            <p style=""color: #555; font-size: 14px; line-height: 1.6; margin: 0;"">
                                <span style=""color: #6C4675; font-weight: bold;"">Trường Mẫu Giáo Little Stars</span> - Nơi nuôi dưỡng ước mơ của bé! <br>
                                Nếu bạn không đăng ký, vui lòng bỏ qua email này.
                            </p>
                            <div style=""margin: 20px 0;"">
                                <a href=""#"" style=""display: inline-block; margin: 0 8px;""><img src=""https://img.icons8.com/color/48/000000/facebook-new.png"" alt=""Facebook"" style=""width: 24px;"" /></a>
                                <a href=""#"" style=""display: inline-block; margin: 0 8px;""><img src=""https://img.icons8.com/color/48/000000/instagram-new.png"" alt=""Instagram"" style=""width: 24px;"" /></a>
                                <a href=""#"" style=""display: inline-block; margin: 0 8px;""><img src=""https://img.icons8.com/color/48/000000/youtube-play.png"" alt=""YouTube"" style=""width: 24px;"" /></a>
                            </div>
                            <p style=""margin: 15px 0 0; color: #6C4675;"">
                                Liên hệ: <a href=""mailto:support@bevui.edu.vn"" style=""color: #FF85A2; text-decoration: none; font-weight: bold;"">support@bevui.edu.vn</a>
                            </p>
                        </td>
                    </tr>
                </table>
                <!-- Copyright -->
                <p style=""color: #888; font-size: 12px; margin-top: 20px; text-align: center;"">
                    © 2023 Trường Mẫu Giáo Bé Vui. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>";

            await _emailService.SendEmailAsync(account.Email, "Account Activation", emailBody);

            return "User registered successfully. Please check your email to activate your account.";
        }

        public async Task<string> LoginAsync(LoginRequest loginDto)
        {
            var user = await _authRepository.LoginAsync(loginDto.Email, loginDto.Password);

            // Check if user exists and password is correct
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
                throw new Exception("Invalid username or password.");

            if (!user.Status!.Equals("Active"))
                throw new Exception("Account is not activated. Please check your email.");

            return GenerateJwtToken(user);
        }

        public async Task ConfirmEmailAsync(string token)
        {
            await _authRepository.ConfirmEmailAsync(token);
        }
        private string GenerateJwtToken(Account user)
        {

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role!.Name),
                new Claim(ClaimTypes.Email, user.Email!)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddMinutes(double.Parse(_configuration["JwtSettings:ExpiryInMinutes"])),
                SigningCredentials = creds,
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // Check email is valid
        private bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            // Check email format using regex
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            return emailRegex.IsMatch(email);
        }

        // Check password is valid
        private bool IsValidPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
                return false;

            var passwordRegex = new Regex(@"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$");
            return passwordRegex.IsMatch(password);
        }

        private bool IsValidPhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrWhiteSpace(phoneNumber))
                return false;

            // Loại bỏ khoảng trắng
            phoneNumber = phoneNumber.Replace(" ", "");
            var phoneRegex = new Regex(@"^(?:\+84|0)(?:\d{9})$");
            return phoneRegex.IsMatch(phoneNumber);
        }

        public async Task<string> ReSendConfirmAccountEmailAsync(string email)
        {
            // Create a confirmation token
            var confirmationToken = Guid.NewGuid().ToString();

            // Send confirmation email
            var confirmationLink = $"http://localhost:3000/confirm?token={confirmationToken}";

            // Get the account by email
            var account = await _accountService.GetAccountByEmailAsync(email);
            if (account == null)
                throw new Exception("Account not found.");

            // Update the account with the new confirmation token
            account.ConfirmationToken = confirmationToken;
            await _accountService.UpdateAccountTokenAsync(account.Email, confirmationToken);

            var emailBody = $@"<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Account Activation</title>
</head>
<body style=""font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 40px 0;"">
    <table width=""100%"" bgcolor=""#f4f7fa"" cellpadding=""0"" cellspacing=""0"">
        <tr>
            <td align=""center"">
                <table width=""600"" bgcolor=""#ffffff"" cellpadding=""0"" cellspacing=""0"" style=""border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;"">
                    <!-- Header -->
                    <tr>
                        <td bgcolor=""#FF9AA2"" style=""padding: 30px 20px; text-align: center;"">
                            <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td style=""text-align: center;"">
                                        <img src=""https://img.icons8.com/doodle/96/000000/abc.png"" alt=""School Logo"" style=""width: 70px; margin-bottom: 15px;"" />
                                        <h1 style=""color: #6C4675; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 1px 1px 2px rgba(255,255,255,0.3);"">Trường Mẫu Giáo Little Stars!</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style=""padding: 40px 30px; text-align: center; background: linear-gradient(to bottom, #ffffff, #fafafa);"">
                            
                            <h2 style=""color: #6C4675; font-size: 24px; margin-bottom: 20px;"">Kích hoạt tài khoản của bạn</h2>
                            
                            <div style=""background-color: #FFF9F0; border-left: 4px solid #FFB347; padding: 20px; border-radius: 8px; text-align: left; margin-bottom: 25px;"">
                                <p style=""color: #555; font-size: 16px; line-height: 1.6; margin: 0;"">
                                    Cảm ơn bạn đã đăng ký tài khoản tại <strong style=""color: #FF85A2;"">Trường Mẫu Giáo Little Stars</strong>! <br><br>
                                    Vui lòng nhấp vào nút bên dưới để kích hoạt tài khoản và bắt đầu hành trình cùng chúng tôi.
                                </p>
                            </div>
                            
                            <a href=""{confirmationLink}"" style=""display: inline-block; background: linear-gradient(135deg, #FF85A2, #FF4D6D); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: bold; margin-top: 10px; box-shadow: 0 4px 15px rgba(255, 77, 109, 0.4); transition: all 0.3s;"">
                                Kích hoạt tài khoản
                            </a>
                        </td>
                    </tr>
                    <!-- Features -->
                    <tr>
                        <td style=""padding: 0 30px 30px 30px; background-color: #fafafa;"">
                            <table width=""100%"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td style=""padding: 10px; text-align: center; width: 33%;"">
                                        <img src=""https://img.icons8.com/doodle/48/000000/teacher.png"" alt=""Quality Teachers"" style=""width: 48px;"" />
                                        <p style=""color: #6C4675; font-size: 14px; font-weight: bold; margin: 10px 0 0;"">Giáo viên chất lượng</p>
                                    </td>
                                    <td style=""padding: 10px; text-align: center; width: 33%;"">
                                        <img src=""https://img.icons8.com/doodle/48/000000/school.png"" alt=""Safe Environment"" style=""width: 48px;"" />
                                        <p style=""color: #6C4675; font-size: 14px; font-weight: bold; margin: 10px 0 0;"">Môi trường an toàn</p>
                                    </td>
                                    <td style=""padding: 10px; text-align: center; width: 33%;"">
                                        <img src=""https://img.icons8.com/doodle/48/000000/baby.png"" alt=""Child Development"" style=""width: 48px;"" />
                                        <p style=""color: #6C4675; font-size: 14px; font-weight: bold; margin: 10px 0 0;"">Phát triển toàn diện</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td bgcolor=""#E0F7FA"" style=""padding: 30px; text-align: center; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;"">
                            <p style=""color: #555; font-size: 14px; line-height: 1.6; margin: 0;"">
                                <span style=""color: #6C4675; font-weight: bold;"">Trường Mẫu Giáo Little Stars</span> - Nơi nuôi dưỡng ước mơ của bé! <br>
                                Nếu bạn không đăng ký, vui lòng bỏ qua email này.
                            </p>
                            <div style=""margin: 20px 0;"">
                                <a href=""#"" style=""display: inline-block; margin: 0 8px;""><img src=""https://img.icons8.com/color/48/000000/facebook-new.png"" alt=""Facebook"" style=""width: 24px;"" /></a>
                                <a href=""#"" style=""display: inline-block; margin: 0 8px;""><img src=""https://img.icons8.com/color/48/000000/instagram-new.png"" alt=""Instagram"" style=""width: 24px;"" /></a>
                                <a href=""#"" style=""display: inline-block; margin: 0 8px;""><img src=""https://img.icons8.com/color/48/000000/youtube-play.png"" alt=""YouTube"" style=""width: 24px;"" /></a>
                            </div>
                            <p style=""margin: 15px 0 0; color: #6C4675;"">
                                Liên hệ: <a href=""mailto:support@bevui.edu.vn"" style=""color: #FF85A2; text-decoration: none; font-weight: bold;"">support@bevui.edu.vn</a>
                            </p>
                        </td>
                    </tr>
                </table>
                <!-- Copyright -->
                <p style=""color: #888; font-size: 12px; margin-top: 20px; text-align: center;"">
                    © 2023 Trường Mẫu Giáo Bé Vui. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>";

            await _emailService.SendEmailAsync(account.Email, "Account Activation", emailBody);
            return "Confirmation email resent successfully. Please check your email to activate your account.";
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var account = await _accountService.GetAccountByEmailAsync(email);
            if (account == null)
            {
                return false; // Email does not exist
            }

            // Generate JWT token to reset password
            string token = GenerateResetToken(account.Email!);

            // Create reset password link
            string clientUrl = _configuration["ClientUrl"]!;
            string resetLink = $"{clientUrl}/reset-password/{token}";

            // Send reset password email
            var emailBody = _emailService.GetResetPasswordEmailBody(resetLink, account.FullName!);
            await _emailService.SendEmailAsync(account.Email!, "Reset your password", emailBody);
            return true;

        }

        private string GenerateResetToken(string email)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["ResetJwt:Key"]!);
            var tokenValidity = int.Parse(_configuration["ResetJwt:TokenValidityMins"]!);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Email, email) }),
                Expires = DateTime.UtcNow.AddMinutes(tokenValidity),
                Issuer = _configuration["ResetJwt:Issuer"],
                Audience = _configuration["ResetJwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string? ValidateResetToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["ResetJwt:Key"]!);

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["ResetJwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["ResetJwt:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);

                if (validatedToken is JwtSecurityToken jwtSecurityToken)
                {
                    if (jwtSecurityToken.ValidTo < DateTime.UtcNow)
                    {
                        throw new SecurityTokenExpiredException("Reset password token has expired. Please request a new one.");
                    }
                }

                var emailClaim = principal.FindFirst(ClaimTypes.Email);
                return emailClaim?.Value;
            }
            catch (SecurityTokenExpiredException ex)
            {
                Console.WriteLine($"Token expired: {ex.Message}");
                return null;
            }
            catch (SecurityTokenException ex)
            {
                Console.WriteLine($"Invalid token: {ex.Message}");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error while validating token: {ex.Message}");
                return null;
            }
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            try
            {
                var email = ValidateResetToken(token);
                if (string.IsNullOrEmpty(email))
                    return false;

                var user = await _accountService.GetAccountByEmailAsync(email);
                if (user == null)
                    return false;

                user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
                await _accountService.UpdateAccountAsync(user); 

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<Account> GetCurrentAccountAsync()
        {
            var email = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
                throw new Exception("Không tìm thấy người dùng.");

            return await _accountRepository.GetAccountByEmailAsync(email);
        }


        public async Task ChangePasswordAsync(ChangePasswordRequest request)
        {
            var user = await GetCurrentAccountAsync();
            if (user == null)
            {
                throw new Exception("Người dùng không tồn tại.");
            }

            // 1. Kiểm tra mật khẩu cũ có đúng không
            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.Password))
            {
                throw new UnauthorizedAccessException("Mật khẩu cũ không chính xác.");
            }

            // 2. Hash mật khẩu mới
            var newHashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            // 3. Gọi repository để cập nhật
            await _accountRepository.ChangePasswordAsync(newHashedPassword, user);
        }



    }
}