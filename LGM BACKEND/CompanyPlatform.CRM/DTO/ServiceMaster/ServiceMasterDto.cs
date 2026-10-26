using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.DTO.ServiceMaster
{
    public class ServiceMasterDto
    {
        public int ServiceId { get; set; }
        public string ServiceDescription { get; set; }
        public string? ServicePartNo { get; set; }
        public decimal ServicePrice { get; set; }
        public string? SACCode { get; set; }
    }
}
