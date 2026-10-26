using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.ERP.Shipment
{
    [Table("Tbl_ShipmentAgencyAssignments")]
    public class ShipmentAgencyAssignment
    {
        [Key]
        public int ShipmentAgencyAssignmentId { get; set; }

        [Required]
        public int ShipmentInitiateId { get; set; }

        [Required]
        public int AgencyId { get; set; }

        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;

        public string? Remarks { get; set; }

        public string? PickerAddress { get; set; }

        public string? DeliveryAddress { get; set; }

        public bool IsDeleted { get; set; } = false;

        [ForeignKey(nameof(ShipmentInitiateId))]
        public virtual ShipmentInitiate ShipmentInitiate { get; set; }

        [ForeignKey(nameof(AgencyId))]
        public virtual Agency Agency { get; set; }
    }
}
