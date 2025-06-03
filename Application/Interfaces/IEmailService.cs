using System.Threading.Tasks;

namespace Application.Interfaces.IServices
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);
        Task SendInvoiceEmailAsync(string toEmail, string subject, string body, byte[] attachmentBytes = null, string attachmentName = "invoice.pdf");
        string GetResetPasswordEmailBody(string resetLink, string Fullname);
    }
}
