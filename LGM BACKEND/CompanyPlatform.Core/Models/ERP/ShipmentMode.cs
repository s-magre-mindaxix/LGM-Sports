using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP
{
    [Table("tbl_ShipmentMode")]
    public class ShipmentMode
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ModeName { get; set; } // AIR / OCEAN

        [Required]
        public string ModeCode { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
