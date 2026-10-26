
using System;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.DTO.CRM.Supplier
{
    public class CreateSupplierDto
    {
        [Required]
        public int BranchId { get; set; }

        [Required]
        [StringLength(50)]
        public string SupplierCode { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string SupplierName { get; set; } = string.Empty;

        [StringLength(15)]
        public string? SupplierGSTIN { get; set; }

        [StringLength(50)]
        public string? SupplierContact { get; set; }

        [StringLength(300)]
        public string? SupplierAddress { get; set; }

        [StringLength(100)]
        public string? PaymentTerms { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;
    }

    public class UpdateSupplierDto : CreateSupplierDto
    {
    }

    public class SupplierResponseDto
    {
        public int SupplierId { get; set; }

        public int BranchId { get; set; }

        public string? BranchName { get; set; }

        public string SupplierCode { get; set; } = string.Empty;

        public string SupplierName { get; set; } = string.Empty;

        public string? SupplierGSTIN { get; set; }

        public string? SupplierContact { get; set; }

        public string? SupplierAddress { get; set; }

        public string? PaymentTerms { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; }
    }
}
