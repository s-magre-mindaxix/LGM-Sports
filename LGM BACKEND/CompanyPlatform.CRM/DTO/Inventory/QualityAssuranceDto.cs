using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.DTO.Inventory
{
    public class QualityAssuranceDto
    {
        public int Id { get; set; }

        public string? ShipmentNo { get; set; }
        public string? PurchaseOrderNo { get; set; }
        public string ItemType { get; set; } // Product or Accessory
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string ItemCode { get; set; }
        public int Quantity { get; set; }
        public string Status { get; set; }
        public string? Remarks { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ActionDate { get; set; } // ADDED THIS FIELD
    }

    public class QAStatusUpdateDto
    {
        public int Id { get; set; }
        public string Status { get; set; } // ACCEPTED or REJECTED
        public string Remarks { get; set; }
    }
}
