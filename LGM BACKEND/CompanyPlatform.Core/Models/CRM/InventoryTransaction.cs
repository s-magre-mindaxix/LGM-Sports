using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    public class InventoryTransaction
    {
        [Key]
        public int Id { get; set; }
        public string ItemType { get; set; } 
        public int ItemId { get; set; }
        public string TransactionType { get; set; } 
        public int Quantity { get; set; }
        public int PreviousStock { get; set; }
        public int NewStock { get; set; }
        public string Remarks { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;

        public int? ShipmentInitiateId { get; set; }

        public int? ShipmentUnderTransitId { get; set; }

        public int? PurchaseOrderId { get; set; }

        public int? InvoiceId { get; set; }

        public int? DispatchId { get; set; }

        public string? ReferenceNo { get; set; }

    }
}
