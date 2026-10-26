
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CompanyPlatform.Core.Models.Inventory;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("Supplier")]
    public class Supplier
    {
        [Key]
        public int SupplierId { get; set; }

        [Required]
        public int BranchId { get; set; }

        [ForeignKey(nameof(BranchId))]
        public virtual Branch? Branch { get; set; }

        [Required]
        [StringLength(50)]
        public string SupplierCode { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string SupplierName { get; set; } = string.Empty;

        [StringLength(15)]
        [RegularExpression(
            @"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$",
            ErrorMessage = "Invalid GSTIN format.")]
        public string? SupplierGSTIN { get; set; }

        [StringLength(50)]
        public string? SupplierContact { get; set; }

        [StringLength(300)]
        public string? SupplierAddress { get; set; }

        [StringLength(100)]
        public string? PaymentTerms { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
