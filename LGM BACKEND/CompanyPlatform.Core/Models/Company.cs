using CompanyPlatform.Core.Models.CRM.Employee;
using System.ComponentModel.DataAnnotations;

namespace CompanyPlatform.Core.Models
{
    public class Company
    {
        [Key]
        public int CompanyId { get; set; }

        [Required]
        [StringLength(20)]
        public string CompanyCode { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        [StringLength(200)]
        public string? LegalName { get; set; }

        [StringLength(100)]
        public string? CompanyShortName { get; set; }

        public string? LogoPath { get; set; }

        public string? PAN { get; set; }
        public string? TAN { get; set; }
        public string? GSTIN { get; set; }
        public string? CIN { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        public ICollection<CompanyAddress> Addresses { get; set; }
            = new List<CompanyAddress>();

        public ICollection<CompanyDirector> Directors { get; set; }
            = new List<CompanyDirector>();

        public ICollection<CompanyBankDetail> BankDetails { get; set; }
            = new List<CompanyBankDetail>();

        public virtual ICollection<Employees> Employees { get; set; }
            = new List<Employees>();
    }
}