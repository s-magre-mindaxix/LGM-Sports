using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_OrderAcceptanceNotes")]
    public class OrderAcceptanceNote
    {
        [Key]
        public int Id { get; set; }

        public int OrderAcceptanceId { get; set; }

        public string Note { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public int CreatedByEmployeeId { get; set; }

        public string AuthorName { get; set; }

        [ForeignKey("OrderAcceptanceId")]
        public virtual OrderAcceptance OrderAcceptance { get; set; }
    }
}
