using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.ReportsDTO
{
    public class ShipmentLandedCostReportDto
    {
        public int ShipmentInitiateId { get; set; }

        public string ShipmentNo { get; set; } = string.Empty;

        public string? CustomerName { get; set; }

        public string? InvoiceNo { get; set; }

        public DateTime? ShipmentDate { get; set; }

        // A
        public decimal InvoiceValue { get; set; }

        public decimal BOEExchangeRate { get; set; }

        public decimal InvoiceValueInINR { get; set; }

        // B
        public decimal CustomDuty { get; set; }

        // C
        public decimal IGST { get; set; }

        // D
        public decimal ForwardingExpense { get; set; }

        // E
        public decimal ClearingExpense { get; set; }

        // F
        public decimal TransportationExpense { get; set; }

        // G
        public decimal OtherCharges { get; set; }

        public decimal TotalLandedCost { get; set; }
    }
}
