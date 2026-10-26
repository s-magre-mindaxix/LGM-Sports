using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP.Shipment
{
    [Table("Tbl_ShipmentInitiates")]
    public class ShipmentInitiate
    {
        [Key]
        public int ShipmentInitiateId { get; set; }

        [Required]
        public string ShipmentNo { get; set; }

        // ORDERACCEPTANCE / PURCHASEORDER
        [Required]
        public string SourceType { get; set; }

        public int? OrderAcceptanceId { get; set; }

        public int? PurchaseOrderId { get; set; }

        public string? SourceDocumentNo { get; set; }

        // Auto Fetch Details
        public int? CustomerId { get; set; }

        public string? CustomerName { get; set; }

        public string? Email { get; set; }
        public string? GSTNo { get; set; }

        public string? ConsigneeAddress { get; set; }

        public string? ShipperAddress { get; set; }

        public decimal? InvoiceValue { get; set; }

        public int? CurrencyId { get; set; }

        public string? CurrencyName { get; set; }

        // Shipment Details
        public int ShipmentModeId { get; set; }

        public string? InvoiceNo { get; set; }

        public DateTime? InvoiceDate { get; set; }

        public string? ImportPackingList { get; set; }

        public DateTime? ImportPackingDate { get; set; }

        public DateTime ShipmentDate { get; set; }

        public string? Remarks { get; set; }

        public string Status { get; set; } = "Shipment Initiated";

        public decimal TotalNetWeightKg { get; set; }

        public decimal TotalGrossWeightKg { get; set; }

        public decimal TotalCBM { get; set; }

        public bool IsDeleted { get; set; } = false;

        // Navigation
        public virtual ShipmentMode ShipmentMode { get; set; }

        public virtual ICollection<ShipmentItem> Items { get; set; } = new List<ShipmentItem>();

        public virtual ICollection<ShipmentAgencyAssignment> ShipmentAgencyAssignments { get; set; } = new List<ShipmentAgencyAssignment>();

        public virtual ICollection<ShipmentSourceItem> SourceItems { get; set; } = new List<ShipmentSourceItem>();

    }
}
