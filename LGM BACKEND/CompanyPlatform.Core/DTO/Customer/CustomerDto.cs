
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.CRM.DTO.Customer
{
    public class CreateCustomerDto
    {
        [Required]
        [StringLength(50)]
        public string CustomerCode { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string CustomerName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? CustomerShortName { get; set; }

        public string? Branch { get; set; }
        public string? PlantCode { get; set; }

        [Required]
        public int CompanyGroupId { get; set; }

        public string? VendorCode { get; set; }
        public string? ForeignVendorCode { get; set; }

        public string? CustomerPAN { get; set; }
        public string? CustomerTAN { get; set; }
        public string? GSTIN { get; set; }
        public string? CIN { get; set; }
        public string? MSMENo { get; set; }

        public string? CustomerMobile { get; set; }
        public string? CustomerEmail { get; set; }

        public string? BillingAddress { get; set; }
        public string? ShippingAddress { get; set; }

        public string? DocsAttachment { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class UpdateCustomerDto : CreateCustomerDto
    {
    }

    public class CustomerResponseDto
    {
        public int Id { get; set; }

        public string CustomerCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerShortName { get; set; }

        public string? Branch { get; set; }
        public string? PlantCode { get; set; }

        public int CompanyGroupId { get; set; }

        public string? VendorCode { get; set; }
        public string? ForeignVendorCode { get; set; }

        public string? CustomerPAN { get; set; }
        public string? CustomerTAN { get; set; }
        public string? GSTIN { get; set; }
        public string? CIN { get; set; }
        public string? MSMENo { get; set; }

        public string? CustomerMobile { get; set; }
        public string? CustomerEmail { get; set; }

        public string? BillingAddress { get; set; }
        public string? ShippingAddress { get; set; }

        public string? DocsAttachment { get; set; }

        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}

