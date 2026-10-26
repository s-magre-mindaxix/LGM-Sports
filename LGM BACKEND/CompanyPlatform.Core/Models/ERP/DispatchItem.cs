using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP
{
    [Table("Tbl_DispatchItems")]
    public class DispatchItem
    {
        [Key]
        public int DispatchItemId { get; set; }

        public int DispatchId { get; set; }

        public string? BoxNo { get; set; }

        public decimal NetWeightKg { get; set; }

        public decimal GrossWeightKg { get; set; }

        public decimal LengthCm { get; set; }

        public decimal WidthCm { get; set; }

        public decimal HeightCm { get; set; }

        public decimal CBM { get; set; }

        public string? Remarks { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }

        [ForeignKey(nameof(DispatchId))]
        public virtual Dispatch Dispatch { get; set; }
    }
}
