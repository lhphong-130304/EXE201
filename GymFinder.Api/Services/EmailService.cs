using System.Net;
using System.Net.Mail;

namespace GymFinder.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpSettings = _configuration.GetSection("SmtpSettings");
        var host = smtpSettings["Host"];
        var port = int.Parse(smtpSettings["Port"] ?? "587");
        var enableSsl = bool.Parse(smtpSettings["EnableSsl"] ?? "true");
        var userName = smtpSettings["UserName"];
        var password = smtpSettings["Password"];

        if (string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(password))
        {
            // If credentials are not set, just log the OTP to console for development
            Console.WriteLine("================================================");
            Console.WriteLine($"DEBUG EMAIL TO: {to}");
            Console.WriteLine($"SUBJECT: {subject}");
            Console.WriteLine($"BODY: {body}");
            Console.WriteLine("================================================");
            return;
        }

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(userName, password),
            EnableSsl = enableSsl
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(userName!),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };
        mailMessage.To.Add(to);

        await client.SendMailAsync(mailMessage);
    }
}
