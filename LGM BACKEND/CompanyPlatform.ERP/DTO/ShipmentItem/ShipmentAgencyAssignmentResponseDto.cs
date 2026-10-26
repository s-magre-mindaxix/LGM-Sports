using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.ShipmentItem
{
    public class ShipmentAgencyAssignmentResponseDto
    {
        public int ShipmentAgencyAssignmentId { get; set; }

        public int ShipmentInitiateId { get; set; }

        public string ShipmentNo { get; set; }

        public int AgencyId { get; set; }

        public string AgencyName { get; set; }

        public string AgencyType { get; set; }


        public DateTime AssignedDate { get; set; }

        public string? Remarks { get; set; }
    }

    public class CreateShipmentAgencyAssignmentDto
    {
        public int ShipmentInitiateId { get; set; }

        public int AgencyId { get; set; }


        public string? PickerAddress { get; set; }

        public string? DeliveryAddress { get; set; }

        public string? Remarks { get; set; }
    }

    public class UpdateShipmentAgencyAssignmentDto
    {
        public int ShipmentAgencyAssignmentId { get; set; }

        public int ShipmentInitiateId { get; set; }

        public int AgencyId { get; set; }


        public string? PickerAddress { get; set; }

        public string? DeliveryAddress { get; set; }

        public string? Remarks { get; set; }
    }

    public class ShipmentDropdownDtos
    {
        public int ShipmentInitiateId { get; set; }
        public string ShipmentNo { get; set; }
        public int ShipmentModeId { get; set; }
        public string ShipmentModeName { get; set; }
    }

    public class ShipmentDetailsDto
    {
        public int ShipmentInitiateId { get; set; }
        public string ShipmentNo { get; set; }
        public string SourceType { get; set; }
        public string? SourceDocumentNo { get; set; }
        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? GSTNo { get; set; }
        public string? ConsigneeAddress { get; set; }
        public string? ShipperAddress { get; set; }
        public decimal? InvoiceValue { get; set; }
        public string? CurrencyName { get; set; }
        public int ShipmentModeId { get; set; }
        public int ShipmentTypeId { get; set; }
        public string? InvoiceNo { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public string? ContainerNo { get; set; }
        public string? BLNo { get; set; }
        public string? AWBNo { get; set; }
        public DateTime ShipmentDate { get; set; }
        public string? Remarks { get; set; }
        public string Status { get; set; }
        public List<ShipmentItemDtos> ShipmentItems { get; set; } = new();
    }

    public class ShipmentItemDtos
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

    public class ShipmentAgencyAssignmentDetailsDto
    {
        public int ShipmentAgencyAssignmentId { get; set; }

        public int ShipmentInitiateId { get; set; }

        public string ShipmentNo { get; set; }

        public string? CustomerName { get; set; }

        public string? GSTNo { get; set; }

        public string? ConsigneeAddress { get; set; }

        public string? ShipperAddress { get; set; }

        public decimal? InvoiceValue { get; set; }

        public string? CurrencyName { get; set; }

        public string? InvoiceNo { get; set; }

        public DateTime? InvoiceDate { get; set; }

        public DateTime ShipmentDate { get; set; }

        public int AgencyId { get; set; }

        public string AgencyName { get; set; }

        public string? ReferenceNo { get; set; }

        public string? PickerAddress { get; set; }

        public string? DeliveryAddress { get; set; }

        public string? Remarks { get; set; }

        public List<ShipmentItemDtos> ShipmentItems { get; set; } = new();
    }

    public class AgencyContactDto
    {
        public string PersonName { get; set; }
        public string Designation { get; set; }
        public string Department { get; set; }
        public string MobileNo { get; set; }
        public string EmailAddress { get; set; }
    }

    public class UploadAgencyDocumentRequest
    {
        public int AgencyId { get; set; }

        public int ShipmentInitiateId { get; set; }

        public List<IFormFile> Documents { get; set; } = new();

    }
}
