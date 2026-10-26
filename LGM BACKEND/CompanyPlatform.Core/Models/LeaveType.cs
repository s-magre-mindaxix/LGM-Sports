using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models
{
   
        [Table("tbl_LeaveType")]
        public class LeaveType
        {
            [Key]
            public int ID { get; set; }

            [Required]
            public string LeaveTypeName { get; set; }

            [DefaultValue(false)]
            public bool IsDeleted { get; set; }

        }
}
