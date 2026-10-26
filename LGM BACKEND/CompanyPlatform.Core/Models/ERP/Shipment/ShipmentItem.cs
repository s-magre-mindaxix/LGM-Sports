using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP.Shipment
{
    [Table("Tbl_ShipmentItems")]
    public class ShipmentItem
    {
        [Key]
        public int ShipmentItemId { get; set; }

        public int ShipmentInitiateId { get; set; }

        public string? BoxNo { get; set; }

        public decimal NetWeightKg { get; set; }

        public decimal GrossWeightKg { get; set; }

        public decimal LengthCm { get; set; }

        public decimal WidthCm { get; set; }

        public decimal HeightCm { get; set; }

        public decimal CBM { get; set; }

        public string? Remarks { get; set; }


        [ForeignKey(nameof(ShipmentInitiateId))]
        public virtual ShipmentInitiate ShipmentInitiate { get; set; }
    }
}
