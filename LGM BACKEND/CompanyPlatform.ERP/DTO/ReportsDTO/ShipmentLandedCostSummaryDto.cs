using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.ReportsDTO
{
    public class ShipmentLandedCostSummaryDto
    {
        public int TotalShipments { get; set; }

        public decimal TotalInvoiceValue { get; set; }

        public decimal TotalForwardingExpense { get; set; }

        public decimal TotalClearingExpense { get; set; }

        public decimal TotalTransportationExpense { get; set; }

        public decimal TotalCustomDuty { get; set; }

        public decimal TotalIGST { get; set; }

        public decimal TotalOtherCharges { get; set; }

        public decimal GrandTotalLandedCost { get; set; }
    }

    public class ShipmentLandedCostResponseDto
    {
        public List<ShipmentLandedCostReportDto> Reports { get; set; }
            = new();

        public ShipmentLandedCostSummaryDto Summary { get; set; }
            = new();
    }
}
