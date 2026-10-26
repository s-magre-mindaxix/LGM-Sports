using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models
{
    public class VendorAddress
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Vendor")]
        public int VendorId { get; set; }
        public virtual Vendor Vendor { get; set; }

        
        public string? AddressType { get; set; }

        public string? FlatBlockNo { get; set; }
        public string? Premises { get; set; }
        public string? RoadStrLane { get; set; }
        public string? Area { get; set; }
        public string? Town { get; set; }

        public string? PinNo { get; set; }

        [ForeignKey("Country")]
        public int CountryId { get; set; }
        public virtual Country Country { get; set; }

        [ForeignKey("State")]
        public int StateId { get; set; }
        public virtual State State { get; set; }

        public string? MobileNo { get; set; }
        public string? AltMobileNo { get; set; }

        public string? EmailAddress { get; set; }
        public string? AltEmailAddress { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
