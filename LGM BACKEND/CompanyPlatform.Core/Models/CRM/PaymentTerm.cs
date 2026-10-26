using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.PaymentTerm
{
    [Table("tbl_PaymentTerm")]
    public class PaymentTerm
    {
        // Primary Key
        [Key]
        public int PaymentTermId { get; set; }

        [Required]
        public string PaymentTermName { get; set; }

        [Required]
        public string PaymentTermCode { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}