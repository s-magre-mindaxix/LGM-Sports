using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP
{
    [Table("tbl_AgencyType")]
    public class AgencyType
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string AgencyTypeName { get; set; } // e.g., "Freight Forwarder", "Customs Broker"

        public bool IsDeleted { get; set; } = false;
    }
}
