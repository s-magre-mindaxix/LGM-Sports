using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_FaultReport")]
    public class FaultReport
    {
        [Key]
        public int Id { get; set; }


        [Required]
        [MaxLength(150)]
        public string Device { get; set; }

        [ForeignKey("Customer")]
        public int CustomerId { get; set; }
        public virtual Customer Customer { get; set; }

        [Required]
        [MaxLength(100)]
        public string SerialNumber { get; set; }

        
        [MaxLength(50)]
        public string Firmware { get; set; }

        
        [MaxLength(100)]
        public string Software { get; set; }

        [MaxLength(50)]
        public string SoftwareVersion { get; set; }

        [MaxLength(100)]
        public string SpecialSoftware { get; set; }

        public string Configuration { get; set; }


        [MaxLength(100)]
        public string PowerSource { get; set; }

        [MaxLength(250)]
        public string CabelsConnected { get; set; } 

        [MaxLength(250)]
        public string ModulesConnected { get; set; }

        [MaxLength(100)]
        public string ModulesFirmware { get; set; }

        [MaxLength(50)]
        public string Voltage { get; set; }

        [MaxLength(100)]
        public string LED { get; set; } 

        [MaxLength(50)]
        public string InternalBattery { get; set; } 

        [MaxLength(50)]
        public string GpsBattery { get; set; } 


        public bool ColdStarted { get; set; } = false;
        public bool DefaultReset { get; set; } = false;
        public bool SettingChecked { get; set; } = false;
        public bool FirmwareUpdated { get; set; } = false;


        public string Notes { get; set; }

        public string Comments { get; set; }

        public string UploadedFiles { get; set; }

        public DateTime ReportDate { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;
    }
}
