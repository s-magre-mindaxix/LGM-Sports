using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using MimeKit;
using CompanyPlatform.ERP.Services.Email;
using CompanyPlatform.Core.Models.ERP.Shipment;

public class ShipmentEmailService : IShipmentEmailService
{
    private readonly IConfiguration _configuration;

    public ShipmentEmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    //public async Task SendAgencyDocumentAsync(string toEmail, string agencyName,string shipmentNo, List<IFormFile> files)
    //{
    //    var message = new MimeMessage();

    //    message.From.Add(new MailboxAddress(
    //        _configuration["SmtpSettings:FromName"],
    //        _configuration["SmtpSettings:SenderEmail"]));

    //    message.To.Add(MailboxAddress.Parse(toEmail));

    //    message.Subject = $"Shipment Document - {shipmentNo} - {agencyName}";


    //    var builder = new BodyBuilder
    //    {
    //        HtmlBody = $@"
    //        <h3>Shipment Agency Document</h3>
    //        <p>Please find attached shipment document.</p>
    //        <p><b>Shipment No :</b> {shipmentNo}</p>
    //        <p><b>Agency :</b> {agencyName}</p>"
    //    };

    //    foreach (var file in files)
    //    {
    //        using var ms = new MemoryStream();

    //        await file.CopyToAsync(ms);

    //        builder.Attachments.Add(
    //            file.FileName,
    //            ms.ToArray(),
    //            ContentType.Parse(file.ContentType));
    //    }

    //    message.Body = builder.ToMessageBody();

    //    using var client = new SmtpClient();

    //    await client.ConnectAsync(
    //        _configuration["SmtpSettings:Server"],
    //        Convert.ToInt32(_configuration["SmtpSettings:Port"]),
    //        SecureSocketOptions.StartTls);

    //    await client.AuthenticateAsync(
    //        _configuration["SmtpSettings:SenderEmail"],
    //        _configuration["SmtpSettings:SenderPassword"]);

    //    await client.SendAsync(message);

    //    await client.DisconnectAsync(true);
    //}

    public async Task SendAgencyDocumentAsync(CompanyPlatform.Core.Models.ERP.Shipment.ShipmentInitiate shipment, string agencyEmail, string agencyName, List<IFormFile> files)
    {
        var message = new MimeMessage();

        message.From.Add(new MailboxAddress(
            _configuration["SmtpSettings:FromName"],
            _configuration["SmtpSettings:SenderEmail"]));

        // Send to Agency
        if (!string.IsNullOrWhiteSpace(agencyEmail))
        {
            message.To.Add(MailboxAddress.Parse(agencyEmail));
        }

        // CC to Shipment Email
        if (!string.IsNullOrWhiteSpace(shipment.Email))
        {
            message.Cc.Add(MailboxAddress.Parse(shipment.Email));
        }

        message.Subject = $"Shipment Document - {shipment.ShipmentNo} - {agencyName}";

        // Generate Table Rows for Shipment Items
        string itemRows = "";
        foreach (var item in shipment.Items)
        {
            itemRows += $@"
            <tr>
                <td style='border: 1px solid #ddd; padding: 8px;'>{item.BoxNo}</td>
                <td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>{item.NetWeightKg}</td>
                <td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>{item.GrossWeightKg}</td>
                <td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>{item.LengthCm}</td>
                <td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>{item.WidthCm}</td>
                <td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>{item.HeightCm}</td>
                <td style='border: 1px solid #ddd; padding: 8px; text-align: center;'><b>{item.CBM:F4}</b></td>
                <td style='border: 1px solid #ddd; padding: 8px;'>{item.Remarks}</td>
            </tr>";
        }

        var builder = new BodyBuilder
        {
            HtmlBody = $@"
        <div style='font-family: Arial, sans-serif; color: #333;'>
            <h3 style='color: #2c3e50;'>Shipment Agency Document</h3>
            <p>Please find the attached shipment documents for your reference.</p>
            
            <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                <tr>
                    <td style='width: 150px; font-weight: bold;'>Shipment No :</td>
                    <td>{shipment.ShipmentNo}</td>
                </tr>
                <tr>
                    <td style='font-weight: bold;'>Agency :</td>
                    <td>{agencyName}</td>
                </tr>
                <tr>
                    <td style='font-weight: bold;'>Remarks :</td>
                    <td>{shipment.Remarks ?? "N/A"}</td>
                </tr>
            </table>

            <h4 style='background-color: #f8f9fa; padding: 10px; border-left: 5px solid #2c3e50;'>Shipment Box Details</h4>
            <table style='width: 100%; border-collapse: collapse; font-size: 12px;'>
                <thead>
                    <tr style='background-color: #f2f4f7; text-align: left;'>
                        <th style='border: 1px solid #ddd; padding: 8px;'>BOX NO</th>
                        <th style='border: 1px solid #ddd; padding: 8px;'>NET WT (KG)</th>
                        <th style='border: 1px solid #ddd; padding: 8px;'>GROSS WT (KG)</th>
                        <th style='border: 1px solid #ddd; padding: 8px;'>LENGTH (CM)</th>
                        <th style='border: 1px solid #ddd; padding: 8px;'>WIDTH (CM)</th>
                        <th style='border: 1px solid #ddd; padding: 8px;'>HEIGHT (CM)</th>
                        <th style='border: 1px solid #ddd; padding: 8px;'>CBM</th>
                        <th style='border: 1px solid #ddd; padding: 8px;'>REMARKS</th>
                    </tr>
                </thead>
                <tbody>
                    {itemRows}
                </tbody>
                <tfoot>
                    <tr style='font-weight: bold; background-color: #f9f9f9;'>
                        <td style='border: 1px solid #ddd; padding: 8px; text-align: right;'>Totals</td>
                        <td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>{shipment.TotalNetWeightKg:F2}</td>
                        <td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>{shipment.TotalGrossWeightKg:F2}</td>
                        <td colspan='3' style='border: 1px solid #ddd; padding: 8px;'></td>
                        <td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>{shipment.TotalCBM:F4}</td>
                        <td style='border: 1px solid #ddd; padding: 8px;'></td>
                    </tr>
                </tfoot>
            </table>
            <p style='margin-top: 20px; font-size: 12px; color: #777;'>This is an automated shipment notification.</p>
        </div>"
        };

        foreach (var file in files)
        {
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            builder.Attachments.Add(
                file.FileName,
                ms.ToArray(),
                ContentType.Parse(file.ContentType));
        }

        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(
            _configuration["SmtpSettings:Server"],
            Convert.ToInt32(_configuration["SmtpSettings:Port"]),
            SecureSocketOptions.StartTls);

        await client.AuthenticateAsync(
            _configuration["SmtpSettings:SenderEmail"],
            _configuration["SmtpSettings:SenderPassword"]);

        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}