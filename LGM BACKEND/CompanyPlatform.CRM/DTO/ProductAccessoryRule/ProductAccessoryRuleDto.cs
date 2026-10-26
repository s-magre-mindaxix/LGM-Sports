
using System;

namespace CompanyPlatform.CRM.DTO.ProductAccessoryRule
{
    public class ProductAccessoryRuleDto
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public string? ProductName { get; set; }

        public int AccessoriesId { get; set; }

        public string? AccessoryName { get; set; }

        public int Quantity { get; set; } = 1;

        public string MandatoryOptional { get; set; } = "Optional";

        public string PricingType { get; set; } = "Default";

        public decimal DefaultPrice { get; set; }

        public DateTime EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }

        public bool Active { get; set; } = true;
    }
}
