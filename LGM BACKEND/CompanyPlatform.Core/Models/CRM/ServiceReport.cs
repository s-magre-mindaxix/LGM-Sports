using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_ServiceReport")]
    public class ServiceReport
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public int? OrderAcceptanceId { get; set; }

        [ForeignKey("OrderAcceptanceId")]
        public virtual OrderAcceptance OrderAcceptance { get; set; }



        [ForeignKey("Customer")]
        public int CustomerId { get; set; }
        public virtual Customer Customer { get; set; }

        public int? ProductId { get; set; }

        public virtual Product? Product { get; set; }

        // Linked to Accessory (Optional)
        public int? AccessoryId { get; set; }
       
        public virtual Accessories? Accessory { get; set; } // Assuming your Accessory model is named Accessory


        [MaxLength(100)]
        public string SerialNumber { get; set; }

        [MaxLength(50)]
        public string? ReportNo { get; set; }

        [MaxLength(2000)]
        public string InspectionSummary { get; set; }

        [MaxLength(2000)]
        public string SoftwareCheck { get; set; }

        [MaxLength(2000)]
        public string PortTesting { get; set; }

        [MaxLength(2000)]
        public string FirmwareCheck { get; set; }

        [MaxLength(2000)]
        public string PhysicalInspection { get; set; }

        [MaxLength(2000)]
        public string ICReplacement { get; set; }

        [MaxLength(2000)]
        public string FinalComments { get; set; }

        public string? CustomerReported { get; set; }
        public string UploadedFiles { get; set; }

        public bool IsDeleted { get; set; } = false;
        public virtual ICollection<ServiceReportItem> Items { get; set; } = new List<ServiceReportItem>();
    }
}
