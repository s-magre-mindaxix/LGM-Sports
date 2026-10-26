using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.Commonmaster
{
    public class PartCondition
    {
        public int Id { get; set; }
        public string PartConditionName { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
