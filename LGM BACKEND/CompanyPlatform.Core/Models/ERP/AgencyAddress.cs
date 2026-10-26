using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP
{
    [Table("tbl_AgencyAddress")]
    public class AgencyAddress
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Agency")]
        public int AgencyId { get; set; }

        public virtual Agency Agency { get; set; }

        public string? AddressType { get; set; }

        public string? FlatBlockNo { get; set; }

        public string? Premises { get; set; }

        public string? RoadStreetLane { get; set; }

        public string? Area { get; set; }

        public string? TownCity { get; set; }

        public string? Pincode { get; set; }

        [ForeignKey("Country")]
        public int CountryId { get; set; }

        public virtual Country Country { get; set; }

        [ForeignKey("State")]
        public int StateId { get; set; }

        public virtual State State { get; set; }

        public string? MobileNo { get; set; }

        public string? AlternateMobileNo { get; set; }

        public string? EmailAddress { get; set; }

        public string? AlternateEmailAddress { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
