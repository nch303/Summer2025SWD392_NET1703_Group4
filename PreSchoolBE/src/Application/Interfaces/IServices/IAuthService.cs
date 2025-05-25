using PreSchoolBE.src.Application.DTOs.Request;

namespace PreSchoolBE.src.Application.Interfaces.IServices
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(RegisterRequest request);
        Task<string> LoginAsync(LoginRequest request);
        Task ConfirmEmailAsync(string token);
    }

}
