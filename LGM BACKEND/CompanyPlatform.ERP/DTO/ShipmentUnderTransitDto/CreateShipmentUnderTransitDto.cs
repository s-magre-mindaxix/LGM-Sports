using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.ShipmentUnderTransitDto
{
    public class CreateShipmentUnderTransitDto
    {
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

        public DateTime? OOCDate { get; set; }

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

        public bool IsChecklistApproved { get; set; }

        public bool IsBOEApproved { get; set; }
        public string? TransitRemarks { get; set; }
    }

    public class UpdateShipmentUnderTransitDto
    {
        public int ShipmentUnderTransitId { get; set; }

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

        public DateTime? OOCDate { get; set; }

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

        public bool IsChecklistApproved { get; set; }

        public bool IsBOEApproved { get; set; }

        public string Status { get; set; }

        public string? TransitRemarks { get; set; }

        public bool IsDelivered { get; set; }

        public bool IsClosed { get; set; }
    }

    public class ShipmentUnderTransitListDto
    {
        public bool ShowAddInventoryButton { get; set; }
        public int ShipmentUnderTransitId { get; set; }

        public int ShipmentInitiateId { get; set; }

        public string ShipmentNo { get; set; }

        public string CustomerName { get; set; }

        public string Status { get; set; }

        public DateTime? DepartureDate { get; set; }

        public DateTime? ExpectedArrivalDate { get; set; }

        public string AgencyName { get; set; }
    }

    public class ShipmentUnderTransitDetailsDto
    {
        public int ShipmentUnderTransitId { get; set; }

        public int ShipmentInitiateId { get; set; }

        public string? ShipmentNo { get; set; }

        public string? CustomerName { get; set; }

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

        public DateTime? OOCDate { get; set; }

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

        public bool IsChecklistApproved { get; set; }

        public bool IsBOEApproved { get; set; }

        public string? TransitRemarks { get; set; }

        public string? Status { get; set; }
    }
}
