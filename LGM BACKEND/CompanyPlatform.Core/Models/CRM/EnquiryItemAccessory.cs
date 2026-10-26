using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Tbl_EnquiryItemAccessories")]
    public class EnquiryItemAccessory
    {
        [Key]
        public int Id { get; set; }

        public int EnquiryItemId { get; set; }

        [Required]
        public int AccessoryId { get; set; }
        [ForeignKey("EnquiryItemId")]
        public virtual EnquiryItem EnquiryItem { get; set; }
    }
}
