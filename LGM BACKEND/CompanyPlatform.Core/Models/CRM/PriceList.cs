using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CompanyPlatform.Core.Models.CRM.Dashboards;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("PriceLists")]
    public class PriceList
    {
        [Key]
        public int PriceListId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string CustomerChannelType { get; set; } = string.Empty;

        [Required]
        public int Id { get; set; }

        [ForeignKey(nameof(Id))]
        public Currency Currency { get; set; } = null!;

        public DateTime EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}