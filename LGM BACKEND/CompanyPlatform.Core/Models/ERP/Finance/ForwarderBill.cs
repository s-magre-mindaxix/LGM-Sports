using CompanyPlatform.Core.Models.ERP.Shipment;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP.Finance
{
    [Table("Tbl_ForwarderBills")]
    public class ForwarderBill
    {
        [Key]
        public int ForwarderBillId { get; set; }

        [Required]
        public int ShipmentInitiateId { get; set; }

        [Required]
        public int ShipmentAgencyAssignmentId { get; set; }

        public string? BillNo { get; set; }

        public DateTime? BillDate { get; set; }

        public decimal BillAmount { get; set; }

        public decimal GstAmount { get; set; }

        [NotMapped]
        public decimal TotalAmount => BillAmount + GstAmount;

        public DateTime? ReceivingDate { get; set; }

        public DateTime? PaymentDate { get; set; }

        public string PaymentStatus { get; set; } = "Pending";

        public string? Remarks { get; set; }

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }

        [ForeignKey(nameof(ShipmentInitiateId))]
        public virtual ShipmentInitiate ShipmentInitiate { get; set; }

        [ForeignKey(nameof(ShipmentAgencyAssignmentId))]
        public virtual ShipmentAgencyAssignment ShipmentAgencyAssignment { get; set; }
    }
}
