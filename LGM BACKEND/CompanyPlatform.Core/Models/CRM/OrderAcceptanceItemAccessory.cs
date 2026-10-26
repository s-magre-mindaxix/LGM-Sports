using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_OrderAcceptanceItemAccessories")]
    public class OrderAcceptanceItemAccessory
    {
        [Key]
        public int Id { get; set; }

        public int OrderAcceptanceItemId { get; set; }

        public int AccessoryId { get; set; }

        [ForeignKey("OrderAcceptanceItemId")]
        public virtual OrderAcceptanceItem OrderAcceptanceItem { get; set; }
    }
}