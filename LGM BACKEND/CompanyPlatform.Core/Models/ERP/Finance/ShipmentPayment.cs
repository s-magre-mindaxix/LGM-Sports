using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CompanyPlatform.Core.Models.ERP.Shipment;

namespace CompanyPlatform.Core.Models.ERP.Finance
{
    [Table("Tbl_ShipmentPayments")]
    public class ShipmentPayment
    {
        [Key]
        public int ShipmentPaymentId { get; set; }

        public int ShipmentUnderTransitId { get; set; }

        public DateTime DeliveredDate { get; set; }

        public int PendingDays { get; set; }

        public bool PaymentCompleted { get; set; }

        public DateTime? PaymentCompletedDate { get; set; }

        public string? FinanceRemarks { get; set; }

        public bool IsDeleted { get; set; }

        [ForeignKey(nameof(ShipmentUnderTransitId))]
        public virtual ShipmentUnderTransit ShipmentUnderTransit { get; set; }
    }
}
