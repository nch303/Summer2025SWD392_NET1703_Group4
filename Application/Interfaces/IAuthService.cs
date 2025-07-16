
using Application.DTOs.Request;
using Domain.Entities;
using PreSchoolBE.src.Application.DTOs.Request;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(RegisterRequest request);
        Task<string> LoginAsync(LoginRequest request);
        Task ConfirmEmailAsync(string token);
        Task<string> ReSendConfirmAccountEmailAsync(string email);
        Task<bool>  ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(string token, string newPassword);
        Task ChangePasswordAsync(ChangePasswordRequest request);
        Task<Account> GetCurrentAccountAsync();


    }

}
