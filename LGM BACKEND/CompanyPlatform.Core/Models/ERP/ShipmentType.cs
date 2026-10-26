using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP
{
    [Table("tbl_ShipmentType")]
    public class ShipmentType
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("ShipmentMode")]
        public int ShipmentModeId { get; set; }

        public ShipmentMode ShipmentMode { get; set; }

        [Required]
        public string TypeName { get; set; }
        // MAWB / HAWB / LCL / FCL

        public string TypeCode { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
