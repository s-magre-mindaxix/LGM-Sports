using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.ProductVariant
{
    public class ProductVariantDto
    {
        public int Id { get; set; }

        public string VariantName { get; set; } = string.Empty;

        [Required]
        public int ProductId { get; set; }

        [Required]
        [StringLength(50)]
        public string VariantCode { get; set; } = string.Empty;

        public string? Attributes { get; set; }

        public bool Active { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }
}