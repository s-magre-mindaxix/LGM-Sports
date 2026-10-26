using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_ServiceMaster")]
    public class ServiceMaster
    {
        [Key]
        public int ServiceId { get; set; }

        [Required]
        public string ServiceDescription { get; set; }

        [Required]
        public string ServicePartNo { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ServicePrice { get; set; }

        public string? SACCode { get; set; }

        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
