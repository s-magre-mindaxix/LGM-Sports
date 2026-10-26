namespace CompanyPlatform.Core.Services.Email
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body);

        Task SendPayslipEmailAsync(string toEmail, string employeeName, string monthYear, string pdfFilePath);
    }
}
