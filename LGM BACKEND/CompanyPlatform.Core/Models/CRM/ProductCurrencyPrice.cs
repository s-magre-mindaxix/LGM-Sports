using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    public class ProductCurrencyPrice
    {
        [Key]
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int CurrencyId { get; set; }
        public decimal Price { get; set; }

        [ForeignKey("ProductId")]
        public virtual Product Product { get; set; }

        [ForeignKey("CurrencyId")]
        public virtual Dashboards.Currency Currency { get; set; }
    }
}
