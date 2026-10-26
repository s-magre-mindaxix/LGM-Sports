using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{

    [Table("Tbl_PurchaseOrderItemAccessories")]
    public class PurchaseOrderItemAccessory
    {
        [Key]
        public int Id { get; set; }

        // FIX: This should point to PurchaseOrderItemId
        public int PurchaseOrderItemId { get; set; }

        public int AccessoryId { get; set; }

        [ForeignKey("PurchaseOrderItemId")]
        public virtual PurchaseOrderItem PurchaseOrderItem { get; set; }
    }
}
