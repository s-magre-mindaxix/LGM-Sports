using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
   

    [Table("tbl_ServiceReportItems")]
    public class ServiceReportItem
    {
        [Key]
        public int Id { get; set; }

        public int ServiceReportId { get; set; }
        [ForeignKey("ServiceReportId")]
        public virtual ServiceReport ServiceReport { get; set; }

        public string ItemType { get; set; } 
        public int? ProductId { get; set; }
        public int? AccessoryId { get; set; }
        public int? ServiceId { get; set; }

        public string? ServicePartNo { get; set; }
        public int Quantity { get; set; }


        [Column(TypeName = "decimal(18,2)")]
        public decimal Rate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Discount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxPercentage { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal GstTax { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal FinalPrice { get; set; } 

        public string? HsnSacCode { get; set; }

        public string Description { get; set; }
    }
}