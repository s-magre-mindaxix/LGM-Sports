using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM.Company
{
    [Table("tbl_ClientType")]
    public class ClientType
    {
        [Key]
        public int ClientTypeId { get; set; }

        [Required]
        public string ClientTypeName { get; set; } = string.Empty;

        [Required]
        public string ClientTypeCode { get; set; } = string.Empty;

        [DefaultValue(true)]
        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}