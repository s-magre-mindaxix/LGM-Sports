using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using System.IO;
using PayrollManagementAPI.Services.Email;

namespace CompanyPlatform.Core.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _smtpSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<SmtpSettings> smtpSettings, ILogger<EmailService> logger)
        {
            _smtpSettings = smtpSettings.Value;
            _logger = logger;
        }

        //public async Task SendEmailAsync(string toEmail, string subject, string body)
        //{
        //    try
        //    {
        //        var fromAddress = new MailAddress(_smtpSettings.SenderEmail, _smtpSettings.FromName);
        //        var toAddress = new MailAddress(toEmail);

        //        var smtp = new System.Net.Mail.SmtpClient
        //        {
        //            Host = _smtpSettings.Server,
        //            Port = _smtpSettings.Port,
        //            EnableSsl = _smtpSettings.EnableSsl,
        //            DeliveryMethod = SmtpDeliveryMethod.Network,
        //            UseDefaultCredentials = false,
        //            Credentials = new NetworkCredential(fromAddress.Address, _smtpSettings.SenderPassword)
        //        };

        //        using (var message = new MailMessage(fromAddress, toAddress)
        //        {
        //            Subject = subject,
        //            Body = body,
        //            IsBodyHtml = true
        //        })
        //        {
        //            await smtp.SendMailAsync(message);
        //            _logger.LogInformation("Email sent successfully to {ToEmail}", toEmail);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail);
        //        throw;
        //    }
        //}



        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            _logger.LogInformation("SendEmailAsync triggered for {Email}", toEmail);

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _smtpSettings.FromName,
                _smtpSettings.SenderEmail));

            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;

            message.Body = new TextPart("html")
            {
                Text = body
            };

            await SendAsync(message);
        }



        public async Task SendPayslipEmailAsync(
            string toEmail,
            string employeeName,
            string monthYear,
            string pdfFilePath)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _smtpSettings.FromName,
                _smtpSettings.SenderEmail));

            message.To.Add(new MailboxAddress(employeeName, toEmail));
            message.Subject = $"Your Payslip for {monthYear}";

            var builder = new BodyBuilder
            {
                HtmlBody = $@"
                    <p>Dear {employeeName},</p>
                    <p>Please find your payslip for <b>{monthYear}</b> attached.</p>
                    <p>Regards,<br/><b>EMINENCE EQUIPMENTS PVT. LTD.</b></p>"
            };

            if (!File.Exists(pdfFilePath))
                throw new FileNotFoundException("Payslip PDF not found.", pdfFilePath);

            builder.Attachments.Add(pdfFilePath);
            message.Body = builder.ToMessageBody();

            await SendAsync(message);
        }

        private async Task SendAsync(MimeMessage message)
        {
            try
            {
                using var client = new MailKit.Net.Smtp.SmtpClient();

                client.CheckCertificateRevocation = false;

                client.AuthenticationMechanisms.Remove("XOAUTH2");

                _logger.LogInformation(
                  "SMTP Connect => Server:{Server}, Port:{Port}, From:{Email}",
                  _smtpSettings.Server,
                  _smtpSettings.Port,
                  _smtpSettings.SenderEmail);

                await client.ConnectAsync(
                    _smtpSettings.Server,
                    _smtpSettings.Port,
                    SecureSocketOptions.StartTls);

                await client.AuthenticateAsync(
                    _smtpSettings.SenderEmail,
                    _smtpSettings.SenderPassword);

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent successfully to {To}", message.To);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SMTP send failed");
                throw;
            }
        }
    }
}
