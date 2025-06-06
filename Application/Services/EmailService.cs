using System.Net.Mail;
using System.Net;
using Application.Interfaces.IServices;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"]);
            var senderName = _configuration["EmailSettings:SenderName"];
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var username = _configuration["EmailSettings:Username"];
            var password = _configuration["EmailSettings:Password"];

            var smtpClient = new SmtpClient(smtpServer)
            {
                Port = smtpPort,
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(toEmail);

            await smtpClient.SendMailAsync(mailMessage);
        }

        public async Task SendInvoiceEmailAsync(string toEmail, string subject, string body, byte[] attachmentBytes = null, string attachmentName = "invoice.pdf")
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"]);
            var senderName = _configuration["EmailSettings:SenderName"];
            var senderEmail = _configuration["EmailSettings:SenderEmail"];
            var username = _configuration["EmailSettings:Username"];
            var password = _configuration["EmailSettings:Password"];

            var smtpClient = new SmtpClient(smtpServer)
            {
                Port = smtpPort,
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true,
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
            };
            mailMessage.To.Add(toEmail);

            // Nếu có file đính kèm (PDF)
            if (attachmentBytes != null)
            {
                var stream = new MemoryStream(attachmentBytes);
                var attachment = new Attachment(stream, attachmentName, "application/pdf");
                mailMessage.Attachments.Add(attachment);
            }

            await smtpClient.SendMailAsync(mailMessage);
        }

        public string GetResetPasswordEmailBody(string resetLink, string fullname)
        {
            return $@"
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }}
        .header {{ background-color: #f8f9fa; padding: 10px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ padding: 20px; }}
        .button {{ display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }}
        .footer {{ background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #6c757d; border-radius: 0 0 5px 5px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Xác thực tài khoản</h2>
        </div>
        <div class='content'>
            <p>Xin chào <strong>{fullname}</strong>,</p>
            <p>Để thực hiện quá trình reset password, vui lòng nhấp vào nút bên dưới:</p>
            <p style='text-align: center;'>
                <a href='{resetLink}' class='button' style='color: white;'>Reset password</a>
            </p>
            <p>Hoặc bạn có thể sao chép và dán đường dẫn sau vào trình duyệt:</p>
            <p style='word-break: break-all;'><a href='{resetLink}'>{resetLink}</a></p>
            <p>Liên kết này sẽ hết hạn sau 5 phút.</p>
            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
            <p>Trân trọng,<br>Đội ngũ Little Stars</p>
        </div>
        <div class='footer'>
            <p>Đây là email tự động, vui lòng không trả lời email này.</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}
