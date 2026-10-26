using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP
{
    [Table("Tbl_DispatchDetails")]
    public class DispatchDetail
    {
        [Key]
        public int DispatchDetailId { get; set; }

        public int DispatchId { get; set; }

        public int OrderAcceptanceId { get; set; }

        [Required]
        [StringLength(100)]
        public string DispatchNo { get; set; }

        public string? CustomerName { get; set; }

        public bool IsSelected { get; set; }

        public string Status { get; set; } = "Pending";

        public bool IsDeleted { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }

        [ForeignKey(nameof(DispatchId))]
        public virtual Dispatch Dispatch { get; set; }
    }
}
