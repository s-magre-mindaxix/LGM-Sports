
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_Customer")]
    public class Customer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(150)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string CustomerCode { get; set; } = string.Empty;

        [StringLength(100)]
        public string? CustomerShortName { get; set; }

        public string? Branch { get; set; }

        public string? PlantCode { get; set; }


        [ForeignKey(nameof(CompanyGroupId))]
        public int CompanyGroupId { get; set; }

        public virtual CompanyGroup CompanyGroup { get; set; } = null!;

        public string? VendorCode { get; set; }

        public string? ForeignVendorCode { get; set; }

        [StringLength(20)]
        public string? CustomerPAN { get; set; }

        [StringLength(20)]
        public string? CustomerTAN { get; set; }

        [StringLength(15)]
        public string? GSTIN { get; set; }

        [StringLength(25)]
        public string? CIN { get; set; }

        [StringLength(50)]
        public string? MSMENo { get; set; }

        [StringLength(20)]
        public string? CustomerMobile { get; set; }

        [StringLength(150)]
        public string? CustomerEmail { get; set; }


        [StringLength(500)]
        public string? BillingAddress { get; set; }

        [StringLength(500)]
        public string? ShippingAddress { get; set; }


        public string? DocsAttachment { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;


        public virtual ICollection<CustomerAddress> Addresses { get; set; }
            = new List<CustomerAddress>();

        public virtual ICollection<CustomerContact> Contacts { get; set; }
            = new List<CustomerContact>();
    }
}
