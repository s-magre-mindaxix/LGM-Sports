using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CompanyPlatform.Core.Models.CRM.Invoice;

namespace CompanyPlatform.Core.Models.ERP
{
    [Table("Tbl_Dispatch")]
    public class Dispatch
    {
        public int DispatchId { get; set; }

        // selected shipment

        public int ShipmentInitiateId { get; set; }

        public string ShipmentNo { get; set; }

        public int? CustomerId { get; set; }

        public string? CustomerName { get; set; }

        // manual fields

        public DateTime? DispatchDate { get; set; }

        public bool MaterialDispatch { get; set; }

        public string? DocketNo { get; set; }

        public DateTime? DeliveredDate { get; set; }

        public bool DeliveredOnDate { get; set; }

        public string? Remarks { get; set; }

        public string Status { get; set; } = "Pending";

        public bool IsDeleted { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }

}
