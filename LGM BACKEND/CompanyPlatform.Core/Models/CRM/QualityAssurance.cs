using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_QualityAssurance")]
    public class QualityAssurance
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ItemType { get; set; } // "Product" or "Accessory"

        [Required]
        public int ItemId { get; set; } // ProductId or AccessoriesId

        [Required]
        public string ItemName { get; set; }

        [Required]
        public string ItemCode { get; set; }

        [Required]
        public int Quantity { get; set; } // THIS is where the quantity "lives" while pending

        [Required]
        public string Status { get; set; } = "PENDING"; // PENDING, ACCEPTED, REJECTED

        public string? Remarks { get; set; }

        public int? ShipmentInitiateId { get; set; }

        public int? ShipmentUnderTransitId { get; set; }

        public int? PurchaseOrderId { get; set; }

        public string? ShipmentNo { get; set; }

        public string? PurchaseOrderNo { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? ActionDate { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
