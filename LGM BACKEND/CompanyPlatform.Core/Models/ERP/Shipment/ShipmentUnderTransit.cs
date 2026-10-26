using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP.Shipment
{
    [Table("Tbl_ShipmentUnderTransit")]
    public class ShipmentUnderTransit
    {
        [Key]
        public int ShipmentUnderTransitId { get; set; }

        [Required]
        public int ShipmentInitiateId { get; set; }

        public int? ShipmentAgencyAssignmentId { get; set; }

        public string? ContainerNo { get; set; }

        public string? VesselFlightNo { get; set; }

        public string? MAWBNo { get; set; }

        public string? HAWBNo { get; set; }

        public string? MBLNo { get; set; }

        public string? HBLNo { get; set; }

        public string? BOENo { get; set; }

        public DateTime? BOEDate { get; set; }

        public DateTime? ChecklistReceivingDate { get; set; }

        public DateTime? ChecklistApprovingDate { get; set; }

        public DateTime? ETDDate { get; set; }

        public DateTime? ETADate { get; set; }

        public DateTime? DepartureDate { get; set; }

        public DateTime? ExpectedArrivalDate { get; set; }

        public DateTime? DutyPaymentDate { get; set; }

        public DateTime? OOCDate { get; set; }   // Out Of Charge Date

        public DateTime? FinalDeliveryDate { get; set; }

        public string? PortOfLoading { get; set; }

        public string? PortOfDischarge { get; set; }

        public string? Destination { get; set; }

        // Checklist Details
        public decimal? ChecklistExchangeRate { get; set; }

        public decimal? ChecklistAssessableValue { get; set; }

        public decimal? ChecklistTotalDuty { get; set; }

        public decimal? ChecklistGST { get; set; }

        public decimal? ChecklistTotalPayable { get; set; }

        // Bill Of Entry Details
        public decimal? BOEExchangeRate { get; set; }

        public decimal? BOEAssessableValue { get; set; }

        public decimal? BOECustomDuty { get; set; }

        public decimal? BOEGST { get; set; }

        public decimal? BOETotalPayable { get; set; }

        public decimal? DutyPenalty { get; set; }

        public decimal? DutyInterest { get; set; }

        public bool IsChecklistApproved { get; set; } = false;

        public bool IsBOEApproved { get; set; } = false;

        // Shipment Status
        public string Status { get; set; } = "In Transit";

        public string? TransitRemarks { get; set; }

        public bool IsDelivered { get; set; } = false;

        public bool IsClosed { get; set; } = false;

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }

        [ForeignKey(nameof(ShipmentInitiateId))]
        public virtual ShipmentInitiate ShipmentInitiate { get; set; }

        [ForeignKey(nameof(ShipmentAgencyAssignmentId))]
        public virtual ShipmentAgencyAssignment ShipmentAgencyAssignment { get; set; }
    }
}
