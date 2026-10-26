using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.ReportsDTO
{
    public class ShipmentStatusReportDto
    {
        public int ShipmentInitiateId { get; set; }

        public string ShipmentNo { get; set; } = string.Empty;

        public string? CustomerName { get; set; }

        public string? InvoiceNo { get; set; }

        public decimal? InvoiceValue { get; set; }

        public string? CurrencyName { get; set; }

        public DateTime ShipmentDate { get; set; }

        public string Status { get; set; } = string.Empty;

        public decimal TotalNetWeightKg { get; set; }

        public decimal TotalGrossWeightKg { get; set; }

        public decimal TotalCBM { get; set; }
    }
}
