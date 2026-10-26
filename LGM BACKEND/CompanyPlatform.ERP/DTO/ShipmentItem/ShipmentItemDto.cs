using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.ShipmentItem
{

    public class ShipmentInitiateDto
    {
        public int ShipmentInitiateId { get; set; }

        public string? ShipmentNo { get; set; }

        // ORDERACCEPTANCE / PURCHASEORDER
        public string SourceType { get; set; }

        public int? OrderAcceptanceId { get; set; }

        public int? PurchaseOrderId { get; set; }

        public string? SourceDocumentNo { get; set; }

        // Auto Fetch
        public int? CustomerId { get; set; }

        public string? CustomerName { get; set; }

        public string? Email { get; set; }

        public string? GSTNo { get; set; }

        public string? ConsigneeAddress { get; set; }

        public string? ShipperAddress { get; set; }

        public decimal? InvoiceValue { get; set; }

        public int? CurrencyId { get; set; }

        public string? CurrencyName { get; set; }

        // Shipment
        public int ShipmentModeId { get; set; }

        public string? ShipmentModeName { get; set; }

        public string? InvoiceNo { get; set; }

        public DateTime? InvoiceDate { get; set; }

        public string? ImportPackingList { get; set; }

        public DateTime? ImportPackingDate { get; set; }

        public DateTime ShipmentDate { get; set; }

        public string? Remarks { get; set; }

        public string? Status { get; set; }

        public List<ShipmentItemDto> Items { get; set; } = new();

        public List<ShipmentSourceItemDto> SourceItems { get; set; } = new();
    }
    public class ShipmentItemDto
    {
        public int ShipmentItemId { get; set; }

        public string? BoxNo { get; set; }

        public decimal NetWeightKg { get; set; }

        public decimal GrossWeightKg { get; set; }

        public decimal LengthCm { get; set; }

        public decimal WidthCm { get; set; }

        public decimal HeightCm { get; set; }

        public decimal CBM { get; set; }

        public string? Remarks { get; set; }
    }

    public class ShipmentListDto
    {
        public int ShipmentInitiateId { get; set; }

        public string ShipmentNo { get; set; }

        public string SourceType { get; set; }

        public string SourceDocumentNo { get; set; }

        public string CustomerName { get; set; }

        public string ShipmentMode { get; set; }

        public string ShipmentType { get; set; }

        public string? InvoiceNo { get; set; }

        public decimal? InvoiceValue { get; set; }

        public DateTime ShipmentDate { get; set; }

        public string Status { get; set; }
    }

    public class ShipmentDropdownDto
    {
        public int Id { get; set; }

        public string Number { get; set; }
    }

    public class ShipmentAutoFillDto
    {
        public int? CustomerId { get; set; }

        public string? CustomerName { get; set; }

        public string? Email { get; set; }

        public string? GSTNo { get; set; }

        public string? ConsigneeAddress { get; set; }

        public string? ShipperAddress { get; set; }

        public decimal? InvoiceValue { get; set; }

        public int? CurrencyId { get; set; }

        public string? CurrencyName { get; set; }

        public List<ShipmentSourceItemDto> SourceItems { get; set; } = new();
    }

    public class ShipmentSourceItemDto
    {
        public int ShipmentSourceItemId { get; set; }

        public string ItemType { get; set; } = "";

        public int? ProductId { get; set; }

        public int? AccessoryId { get; set; }

        public string? ItemCode { get; set; }

        public string? PartNo { get; set; }

        public string? ItemName { get; set; }

        public int Quantity { get; set; }

        public string? Unit { get; set; }
    }
}
