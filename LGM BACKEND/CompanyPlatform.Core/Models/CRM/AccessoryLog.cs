using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    public class AccessoryLog
    {
        [Key]
        public int LogId { get; set; }
        public int AccessoryId { get; set; }
        public string ActionType { get; set; }
        public int Quantity { get; set; }
        public string Reason { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }
}
