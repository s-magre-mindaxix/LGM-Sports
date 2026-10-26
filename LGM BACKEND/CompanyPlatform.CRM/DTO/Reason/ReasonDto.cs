using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Reason
{
    public class ReasonDto
    {
        public int ReasonId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string ReasonType { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}