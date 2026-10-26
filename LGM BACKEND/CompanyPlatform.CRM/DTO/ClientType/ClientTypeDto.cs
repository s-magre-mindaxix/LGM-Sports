using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.ClientType
{
    public class ClientTypeDto
    {
        public int ClientTypeId { get; set; }

        [Required]
        public string ClientTypeName { get; set; } = string.Empty;

        public string ClientTypeCode { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
    }
}