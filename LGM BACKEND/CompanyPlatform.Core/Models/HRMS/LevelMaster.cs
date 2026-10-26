using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.HRMS
{
    [Table("tbl_LevelMasters")]
    public class LevelMaster
    {
        [Key]
        public int ID { get; set; }

        public string? LevelName { get; set; }

        public int LevelOrder { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}
