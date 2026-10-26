using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_OfferItemAccessories")]
    public class OfferItemAccessory
    {
        [Key]
        public int Id { get; set; }
        public int OfferItemId { get; set; }
        public int AccessoryId { get; set; }

        [ForeignKey("OfferItemId")]
        public virtual OfferItem OfferItem { get; set; }
    }
}
