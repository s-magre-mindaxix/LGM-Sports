using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.Models.CRM
{
    public class PurchaseOrderOffer
    {
        public int Id { get; set; }

        public int PurchaseOrderId { get; set; }
        public int OfferId { get; set; }

        public int? CustomerId { get; set; }
        public int? VendorId { get; set; }
        public int? CompanyId { get; set; }

        public int? ProductGroupId { get; set; }
        public int? CompanyGroupId { get; set; }

        public int? CurrencyId { get; set; }
        public int? PlaceOfSupplyId { get; set; }

        public int? BankDetailId { get; set; }
        public int? ResponsiblePersonId { get; set; }
        public int? AssignedToEmployeeId { get; set; }

        public DateTime? OfferCreateDate { get; set; }
        public DateTime? OfferExpiryDate { get; set; }

        public string CompanyCode { get; set; }
        public string VendorCode { get; set; }
        public string Address { get; set; }

        public decimal? FreightCharges { get; set; }
        public string CustomerNotes { get; set; }
        public string? GaxcePurchaseOrderNo { get; set; }


        public PurchaseOrder PurchaseOrder { get; set; }
    }
}
