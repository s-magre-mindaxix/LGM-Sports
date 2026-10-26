using CompanyPlatform.ERP.DTO.ShipmentItem;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.DispatchDto
{
    public class CreateDispatchDto
    {
        public int ShipmentInitiateId { get; set; }

        public DateTime? DispatchDate { get; set; }

        public bool MaterialDispatch { get; set; }

        public string? DocketNo { get; set; }

        public DateTime? DeliveredDate { get; set; }

        public bool DeliveredOnDate { get; set; }

        public string? Remarks { get; set; }

        public List<CreateDispatchDetailDto> DispatchDetails { get; set; } = new();

        public List<CreateDispatchItemDto> DispatchItems { get; set; } = new();

        public List<CreateDispatchStockItemDto> StockItems { get; set; } = new();
    }

    public class CreateDispatchDetailDto
    {
        public int OrderAcceptanceId { get; set; }

        public string DispatchNo { get; set; }

        public string? CustomerName { get; set; }

        public bool IsSelected { get; set; }
    }
    public class UpdateDispatchDto
    {
        public int DispatchId { get; set; }

        public DateTime? DispatchDate { get; set; }

        public bool MaterialDispatch { get; set; }

        public string? DocketNo { get; set; }

        public DateTime? DeliveredDate { get; set; }

        public bool DeliveredOnDate { get; set; }

        public string? Remarks { get; set; }

        public string Status { get; set; } = "Pending";

        // ADD THESE
        public List<CreateDispatchDetailDto> DispatchDetails { get; set; } = new();

        public List<CreateDispatchItemDto> DispatchItems { get; set; } = new();

        public List<CreateDispatchStockItemDto> StockItems { get; set; } = new();
    }

    public class DispatchDto
    {
        public int DispatchId { get; set; }

        public int ShipmentInitiateId { get; set; }

        public string ShipmentNo { get; set; }

        public int? CustomerId { get; set; }

        public string? CustomerName { get; set; }

        public DateTime? DispatchDate { get; set; }

        public bool MaterialDispatch { get; set; }

        public string? DocketNo { get; set; }

        public DateTime? DeliveredDate { get; set; }

        public bool DeliveredOnDate { get; set; }

        public string? Remarks { get; set; }

        public string Status { get; set; }

        public List<DispatchSelectionDto> DispatchDetails { get; set; } = new();

        public List<CreateDispatchItemDto> DispatchItems { get; set; } = new();

        public List<CreateDispatchStockItemDto> StockItems { get; set; } = new();
    }

    public class DispatchShipmentDropdownDto
    {
        public int ShipmentInitiateId { get; set; }

        public string ShipmentNo { get; set; }
    }

    public class DispatchShipmentDetailsDto
    {
        public int ShipmentInitiateId { get; set; }

        public string ShipmentNo { get; set; }

        public List<ShipmentItemDto> Items { get; set; } = new();

        public List<DispatchSelectionDto> Dispatches { get; set; } = new();

    }

    public class DispatchSelectionDto
    {
        public int OrderAcceptanceId { get; set; }

        public string DispatchNo { get; set; }

        public string CustomerName { get; set; }

        public bool IsSelected { get; set; }
    }

    public class CreateDispatchItemDto
    {
        public string? BoxNo { get; set; }

        public decimal NetWeightKg { get; set; }

        public decimal GrossWeightKg { get; set; }

        public decimal LengthCm { get; set; }

        public decimal WidthCm { get; set; }

        public decimal HeightCm { get; set; }

        public decimal CBM { get; set; }

        public string? Remarks { get; set; }
    }

    public class CreateDispatchStockItemDto
    {
        public string ItemType { get; set; } = string.Empty;

        public int? ProductId { get; set; }

        public int? AccessoryId { get; set; }

        public string? ItemCode { get; set; }

        public string? Description { get; set; }

        public decimal Qty { get; set; }
    }
}
