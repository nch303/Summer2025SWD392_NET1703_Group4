
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using PreSchoolBE.src.Application.Interfaces.IServices;
using PreSchoolBE.src.Infrastructure.Entities;
using PreSchoolBE.src.Infrastructure.EntitiesConfigurations;
using PreSchoolBE.src.Application.DTOs.Request;
using PreSchoolBE.src.Application.Services;

namespace Application.Services.AuthService
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            _emailService = new EmailService(configuration);
        }

        public async Task<string> RegisterAsync(RegisterRequest  registerDto)
        {
            if (await _context.Accounts.AnyAsync(u => u.Email == registerDto.Email))
                throw new Exception("Email already exists.");


            // Create a confirmation token
            var confirmationToken = Guid.NewGuid().ToString();

            var parent = new Account
            {
                FullName = registerDto.FullName,
                Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                Email = registerDto.Email,
                PhoneNumber = registerDto.PhoneNumber,
                RoleId = 2,  // Assuming 2 is the default role ID for parents
                Status = "Inactive",
                ConfirmationToken = confirmationToken
            };

            _context.Accounts.Add(parent);
            await _context.SaveChangesAsync();

            // Send confirmation email
            var confirmationLink = $"https://yourdomain.com/api/auth/confirm?token={confirmationToken}";


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
                            
                            <a href=""{{confirmationLink}}"" style=""display: inline-block; background: linear-gradient(135deg, #FF85A2, #FF4D6D); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: bold; margin-top: 10px; box-shadow: 0 4px 15px rgba(255, 77, 109, 0.4); transition: all 0.3s;"">
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
                                <span style=""color: #6C4675; font-weight: bold;"">Trường Mẫu Giáo Bé Vui</span> - Nơi nuôi dưỡng ước mơ của bé! <br>
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

            await _emailService.SendEmailAsync(parent.Email, "Account Activation", emailBody);

            return "User registered successfully. Please check your email to activate your account.";
        }

        public async Task<string> LoginAsync(LoginRequest loginDto)
        {
            var user = await _context.Accounts
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
                throw new Exception("Invalid username or password.");

            if (!user.Status!.Equals("Inactive"))
                throw new Exception("Account is not activated. Please check your email.");

            return GenerateJwtToken(user);
        }

        public async Task ConfirmEmailAsync(string token)
        {
            var user = await _context.Accounts.FirstOrDefaultAsync(u => u.ConfirmationToken == token);
            if (user == null)
                throw new Exception("Invalid confirmation token.");

            user.Status = "Active";
            user.ConfirmationToken = null; // Delete the confirmation token after successful activation
            await _context.SaveChangesAsync();
        }
        private string GenerateJwtToken(Account user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName)
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
    }
}