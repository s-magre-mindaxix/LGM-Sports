using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.ForwarderBillDto
{
    public class CreateForwarderBillDto
    {
        public int ShipmentInitiateId { get; set; }

        public int ShipmentAgencyAssignmentId { get; set; }

        public string? BillNo { get; set; }

        public DateTime? BillDate { get; set; }

        public decimal BillAmount { get; set; }

        public decimal GstAmount { get; set; }

        public DateTime? ReceivingDate { get; set; }

        public DateTime? PaymentDate { get; set; }

        public string? Remarks { get; set; }
    }

    public class UpdateForwarderBillDto
    {
        public int ForwarderBillId { get; set; }

        public string? BillNo { get; set; }

        public DateTime? BillDate { get; set; }

        public decimal BillAmount { get; set; }

        public decimal GstAmount { get; set; }

        public DateTime? ReceivingDate { get; set; }

        public DateTime? PaymentDate { get; set; }

        public string PaymentStatus { get; set; }

        public string? Remarks { get; set; }
    }

    public class ForwarderBillListDto
    {
        public int ForwarderBillId { get; set; }

        public string ShipmentNo { get; set; }

        public string AgencyName { get; set; }

        public string? BillNo { get; set; }

        public DateTime? BillDate { get; set; }

        public decimal BillAmount { get; set; }

        public decimal GstAmount { get; set; }

        public decimal TotalAmount { get; set; }

        public string PaymentStatus { get; set; }
    }

    public class ForwarderBillDetailsDto
    {
        public int ForwarderBillId { get; set; }

        public int ShipmentInitiateId { get; set; }

        public int ShipmentAgencyAssignmentId { get; set; }

        public string ShipmentNo { get; set; }

        public string AgencyName { get; set; }

        public string? BillNo { get; set; }

        public DateTime? BillDate { get; set; }

        public decimal BillAmount { get; set; }

        public decimal GstAmount { get; set; }

        public decimal TotalAmount { get; set; }

        public DateTime? ReceivingDate { get; set; }

        public DateTime? PaymentDate { get; set; }

        public string PaymentStatus { get; set; }

        public string? Remarks { get; set; }
    }

    public class EligibleShipmentDto
    {
        public int ShipmentInitiateId { get; set; }

        public int ShipmentAgencyAssignmentId { get; set; }

        public string ShipmentNo { get; set; }

        public string AgencyName { get; set; }
    }
}
