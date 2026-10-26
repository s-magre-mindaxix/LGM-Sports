using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CompanyPlatform.Core.Models;
using System.ComponentModel.DataAnnotations;


namespace CompanyPlatform.Core.Models
{
    public class Vendor
    {
        [Key]
        public int Id { get; set; }

        public string VendorName { get; set; }

        public string VendorCode { get; set; }

        public string? VendorShortName { get; set; }

        public string? VendorDivision { get; set; }

        public string? VendorLogo { get; set; }

        public string? VendorPAN { get; set; }

        public string? VendorTAN { get; set; }

        public string? VATNo { get; set; }

        public string? MSMENo { get; set; }

        public string? GSTIN { get; set; }

        public string? CIN { get; set; }

        public bool IsDeleted { get; set; } = false;

        // One-to-Many Navigation Properties
        public virtual ICollection<VendorAddress> Addresses { get; set; } = new List<VendorAddress>();
        public virtual ICollection<VendorContact> PrincipalContacts { get; set; } = new List<VendorContact>();
        public virtual ICollection<VendorBankDetail> BankDetails { get; set; } = new List<VendorBankDetail>();
    }
}
