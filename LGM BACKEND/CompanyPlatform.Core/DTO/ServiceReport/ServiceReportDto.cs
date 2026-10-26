using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.DTO.ServiceReport
{
    public class ServiceReportDto
    {
        public int Id { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int CustomerId { get; set; }

        public int OrderAcceptanceId { get; set; }
        public string? CustomerName { get; set; } // To display in the UI

        public int? ProductId { get; set; }
        public string? ProductName { get; set; }
        public int? AccessoryId { get; set; }
        public string? AccessoryName { get; set; }

        [MaxLength(100)]
        public string SerialNumber { get; set; }

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

        public string? UploadedFiles { get; set; }
        public List<ServiceReportItemDto> Items { get; set; } = new List<ServiceReportItemDto>();

        public List<IFormFile>? ReportFiles { get; set; } = new List<IFormFile>();

        public List<string>? FilesToDelete { get; set; }
    }

    public class ServiceReportItemDto
    {
        public string ItemType { get; set; }
        public int ProductId { get; set; }
        public int AccessoryId { get; set; }
        public int ServiceId { get; set; }
        public string? ServicePartNo { get; set; }
        public int Quantity { get; set; }
        public string Description { get; set; }

        // --- ADDED FIELDS ---
        public decimal Rate { get; set; }

        public decimal Discount { get; set; }

        public decimal TaxPercentage { get; set; }

        public decimal GstTax { get; set; }

        public decimal FinalPrice { get; set; }
        public string? HsnSacCode { get; set; }
    }
}
