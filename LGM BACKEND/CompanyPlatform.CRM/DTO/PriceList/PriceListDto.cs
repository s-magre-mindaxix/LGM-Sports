
using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.PriceList
{
    public class PriceListDto
    {
        public int PriceListId { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string CustomerChannelType { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int Id { get; set; }

        public DateTime EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
    }
}
