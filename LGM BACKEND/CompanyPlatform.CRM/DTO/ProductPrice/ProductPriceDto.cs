using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTOs
{
    public class ProductPriceDto
    {
        public int ProductPriceId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int PriceListId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int ProductId { get; set; }

        [Required]
        [MaxLength(50)]
        public string PriceType { get; set; } = string.Empty;

        [Range(typeof(decimal), "0.01", "9999999999999999")]
        public decimal Amount { get; set; }

        [Range(1, int.MaxValue)]
        public int MinQty { get; set; } = 1;

        [Required]
        public DateTime EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}