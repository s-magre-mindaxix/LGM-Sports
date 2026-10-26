using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP.Shipment
{
    [Table("Tbl_ShipmentSourceItems")]
    public class ShipmentSourceItem
    {
        [Key]
        public int ShipmentSourceItemId { get; set; }

        public int ShipmentInitiateId { get; set; }

        public string ItemType { get; set; } = "";

        public int? ProductId { get; set; }

        public int? AccessoryId { get; set; }

        public string? ItemCode { get; set; }

        public string? PartNo { get; set; }
        public string? ItemName { get; set; }

        public int Quantity { get; set; }

        public string? Unit { get; set; }

        [ForeignKey(nameof(ShipmentInitiateId))]
        public virtual ShipmentInitiate ShipmentInitiate { get; set; }
    }
}
