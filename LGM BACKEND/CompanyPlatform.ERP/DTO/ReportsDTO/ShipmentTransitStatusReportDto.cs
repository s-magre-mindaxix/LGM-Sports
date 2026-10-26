using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.ReportsDTO
{
    public class ShipmentTransitStatusReportDto
    {
        public string ShipmentNo { get; set; } = string.Empty;

        public string? CustomerName { get; set; }

        public string? ContainerNo { get; set; }

        public string? VesselFlightNo { get; set; }

        public string? PortOfLoading { get; set; }

        public string? PortOfDischarge { get; set; }

        public string? Destination { get; set; }

        public DateTime? DepartureDate { get; set; }

        public DateTime? ExpectedArrivalDate { get; set; }

        public DateTime? FinalDeliveryDate { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}
