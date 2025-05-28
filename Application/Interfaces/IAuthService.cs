
using PreSchoolBE.src.Application.DTOs.Request;
using System.Threading.Tasks;

namespace PreSchoolBE.src.Application.Interfaces.IServices
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(RegisterRequest request);
        Task<string> LoginAsync(LoginRequest request);
        Task ConfirmEmailAsync(string token);
    }

}
