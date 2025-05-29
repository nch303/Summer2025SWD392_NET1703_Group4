using System.Threading.Tasks;

namespace Application.Interfaces.IServices
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }
}
