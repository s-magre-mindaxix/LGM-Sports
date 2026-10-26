using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.Services.Email
{
    public interface IShipmentEmailService
    {
        Task SendAgencyDocumentAsync(CompanyPlatform.Core.Models.ERP.Shipment.ShipmentInitiate shipment, string agencyEmail, string agencyName, List<IFormFile> files);

    }
}
