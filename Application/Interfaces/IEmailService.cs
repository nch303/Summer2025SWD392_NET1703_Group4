using System.Threading.Tasks;

namespace PreSchoolBE.src.Application.Interfaces.IServices
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
    }
}
