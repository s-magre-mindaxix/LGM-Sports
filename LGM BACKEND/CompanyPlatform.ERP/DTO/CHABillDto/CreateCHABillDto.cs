using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.ERP.DTO.CHABillDto
{
    public class CreateCHABillDto
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

    public class UpdateCHABillDto
    {
        public int CHABillId { get; set; }

        public string? BillNo { get; set; }

        public DateTime? BillDate { get; set; }

        public decimal BillAmount { get; set; }

        public decimal GstAmount { get; set; }

        public DateTime? ReceivingDate { get; set; }

        public DateTime? PaymentDate { get; set; }

        public string? Remarks { get; set; }
    }

    public class CHABillListDto
    {
        public int CHABillId { get; set; }

        public string ShipmentNo { get; set; }

        public string AgencyName { get; set; }

        public string? BillNo { get; set; }

        public DateTime? BillDate { get; set; }

        public decimal BillAmount { get; set; }

        public decimal GstAmount { get; set; }

        public decimal TotalAmount { get; set; }

        public string PaymentStatus { get; set; }
    }

    public class CHABillDetailsDto
    {
        public int CHABillId { get; set; }

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
