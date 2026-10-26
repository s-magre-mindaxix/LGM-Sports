using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.Commonmaster
{
    public class ProductType
    {
        public int Id { get; set; }
        public string ProductTypeName { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
