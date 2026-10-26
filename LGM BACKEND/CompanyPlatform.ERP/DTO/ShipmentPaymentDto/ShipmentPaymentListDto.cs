using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.ShipmentPaymentDto
{
    public class ShipmentPaymentListDto
    {
        public int ShipmentPaymentId { get; set; }

        public int ShipmentUnderTransitId { get; set; }

        public string ShipmentNo { get; set; }

        public string CustomerName { get; set; }

        public string InvoiceNo { get; set; }

        public DateTime DeliveredDate { get; set; }

        public int PendingDays { get; set; }

        public bool PaymentCompleted { get; set; }

        public DateTime? PaymentCompletedDate { get; set; }

        public string Status { get; set; }

        public string? FinanceRemarks { get; set; }
    }

    public class ShipmentPaymentDetailsDto
    {
        public int ShipmentPaymentId { get; set; }

        public int ShipmentUnderTransitId { get; set; }

        public string ShipmentNo { get; set; }

        public string CustomerName { get; set; }

        public string InvoiceNo { get; set; }

        public decimal InvoiceValue { get; set; }

        public string CurrencyName { get; set; }

        public DateTime DeliveredDate { get; set; }

        public int PendingDays { get; set; }

        public bool PaymentCompleted { get; set; }

        public DateTime? PaymentCompletedDate { get; set; }

        public string? FinanceRemarks { get; set; }

        public string Status { get; set; }
    }

    public class UpdateShipmentPaymentDto
    {
        public int ShipmentPaymentId { get; set; }
        public DateTime DeliveredDate { get; set; }

        public DateTime? PaymentCompletedDate { get; set; }
        public bool PaymentCompleted { get; set; }

        public string? FinanceRemarks { get; set; }
    }

    public class CreateShipmentPaymentDto
    {
        public int ShipmentUnderTransitId { get; set; }

        public DateTime DeliveredDate { get; set; }

        public string? FinanceRemarks { get; set; }
    }

    public class EligibleTransitDto
    {
        public int ShipmentUnderTransitId { get; set; }

        public string ShipmentNo { get; set; } = string.Empty;

        public string CustomerName { get; set; } = string.Empty;

        public string InvoiceNo { get; set; } = string.Empty;

        public DateTime? FinalDeliveryDate { get; set; }
    }
}
