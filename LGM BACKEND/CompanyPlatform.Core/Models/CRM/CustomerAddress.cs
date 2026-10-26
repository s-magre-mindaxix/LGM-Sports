using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    [Table("tbl_CustomerAddress")]
    public class CustomerAddress
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Customer")]
        public int CustomerId { get; set; }
        public virtual Customer Customer { get; set; }

        [Required, MaxLength(50)]
        public string AddressType { get; set; } // e.g., Correspondence, Permanent

        [MaxLength(50)]
        public string FlatBlockNo { get; set; }

        [MaxLength(200)]
        public string PremisesName { get; set; }

        [MaxLength(200)]
        public string Road { get; set; }

        [MaxLength(100)]
        public string Area { get; set; }

        [MaxLength(100)]
        public string Town { get; set; }

        [MaxLength(10)]
        public string PinNo { get; set; }

        [ForeignKey("Country")]
        public int CountryId { get; set; }
        public virtual Country Country { get; set; }

        [ForeignKey("State")]
        public int StateId { get; set; }
        public virtual State State { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
