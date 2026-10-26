using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    public class AccessoryCurrencyPrice
    {
        [Key]
        public int Id { get; set; }
        public int AccessoriesId { get; set; }
        public int CurrencyId { get; set; }
        public decimal Price { get; set; }

        [ForeignKey("AccessoriesId")]
        public virtual Accessories Accessory { get; set; }

        [ForeignKey("CurrencyId")]
        public virtual Dashboards.Currency Currency { get; set; }
    }
}
