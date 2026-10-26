using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_Industry")]
    public class Industry
    {
        [Key]
        public int IndustryId { get; set; }

        [Required]
        public string IndustryName { get; set; }

        [Required]
        public string IndustryCode { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}



//    [Table("tbl_Industry")]
//    public class Industry
//    {
//        [Key]
//        public int ID { get; set; }

//        [Required]
//        public string IndustryName { get; set; }

//        public string Description { get; set; }

//        [DefaultValue(true)]
//        public bool IsActive { get; set; }
//    }
//}
