using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    public class ScrapItem
    {
        [Key]
        public int Id { get; set; }
        public string ItemType { get; set; }
        public int ItemId { get; set; }
        public int Quantity { get; set; }
        public string Reason { get; set; }
        public DateTime ScrapDate { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;
    }
}
