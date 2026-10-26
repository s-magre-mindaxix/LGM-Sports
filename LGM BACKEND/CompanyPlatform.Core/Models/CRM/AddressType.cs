using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.AddressType
{
    [Table("tbl_AddressType")]
    public class AddressType
    {
        // Primary Key
        [Key]
        public int AddressTypeId { get; set; }

        [Required]
        public string AddressTypeName { get; set; }

        [Required]
        public string AddressTypeCode { get; set; }

        [DefaultValue(true)]
        public bool IsActive { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}