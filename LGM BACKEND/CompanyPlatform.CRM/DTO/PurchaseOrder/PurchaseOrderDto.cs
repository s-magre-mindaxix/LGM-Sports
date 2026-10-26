namespace CompanyPlatform.CRM.DTO.PurchaseOrder
{
    public class PurchaseOrderDto
    {
        public int PurchaseOrderId { get; set; }
        public int? OrderAcceptanceId { get; set; }
        public string? PurchaseOrderNo { get; set; }      // New unique generated
        public string? GaxcePurchaseOrderNo { get; set; } // From OA
        public string? CustomerOrderNo { get; set; }      // From OA
        public DateTime? NextFollowUpDate { get; set; } // CS0117 Error साठी

        public DateTime? CustomerOrderDate { get; set; }
        public DateTime? PurchaseOrderDate { get; set; }
        public string? InvoiceNo { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public DateTime? OfferCreateDate { get; set; }
        public DateTime? OfferExpiryDate { get; set; }
        public string? CompanyCode { get; set; }
        public string? VendorCode { get; set; }

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

        public decimal? Subtotal { get; set; }
        public decimal? FreightCharges { get; set; }
        public decimal? GrandTotal { get; set; }

        public string? Address { get; set; }
        public string? TermsConditions { get; set; }
        public string? CustomerNotes { get; set; }
        public string? Status { get; set; }
        public string? CustomerName { get; set; }
        public string? CurrencySymbol { get; set; }
        public List<int> OrderAcceptanceIds { get; set; } // CS0117 Error साठी
        public List<PurchaseOrderOfferDto> Offers { get; set; }
        public List<PurchaseOrderItemDto> Items { get; set; } = new();
    }
    public class PurchaseOrderOfferDto
    {
        public int OfferId { get; set; }

        public int? CustomerId { get; set; }
        public int? VendorId { get; set; }
        public int? CompanyId { get; set; }

        public int? ProductGroupId { get; set; }
        public int? CompanyGroupId { get; set; }

        public int? CurrencyId { get; set; }

        public string? CurrencySymbol { get; set; }
        public int? PlaceOfSupplyId { get; set; }

        public int? BankDetailId { get; set; }
        public int? ResponsiblePersonId { get; set; }
        public int? AssignedToEmployeeId { get; set; }

        public DateTime? OfferCreateDate { get; set; }
        public DateTime? OfferExpiryDate { get; set; }

        public string GaxcePurchaseOrderNo { get; set; } // CS0117 Error साठी
        public string CompanyCode { get; set; }
        public string? VendorCode { get; set; }
        public string Address { get; set; }

        public decimal? FreightCharges { get; set; }
        public string CustomerNotes { get; set; }
    }
    public class PurchaseOrderItemDto
    {
        public string ItemType { get; set; } = "Product";
        public string? PartNo { get; set; }
        public int ProductId { get; set; }
        public int AccessoryId { get; set; }
        public string? Description { get; set; }
        public string? ProductDescription { get; set; }
        public string? AccessoriesDescription { get; set; }
        public string? HsnSacCode { get; set; }
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Discount { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal Total { get; set; }
        public decimal GstAmount { get; set; }
        public decimal? CgstAmount { get; set; }
        public decimal? SgstAmount { get; set; }
        public decimal? IgstAmount { get; set; }
        public decimal FinalPrice { get; set; }
        public string SourceOA { get; set; }
        public List<int> AccessoryIds { get; set; } = new();
        public int? MasterCurrencyId { get; set; }
        public int PurchaseOrderItemId { get; set; }
        public string? ProductSource { get; set; }
        public List<ItemCurrencyPriceDto> CurrencyPrices { get; set; } = new();
        public class ItemCurrencyPriceDto
        {
            public int CurrencyId { get; set; }

            public string? CurrencyName { get; set; }
            public decimal Price { get; set; }
        }
    }

    public class PurchaseOrderPdfDto
    {
        public string CompanyName { get; set; }
        public string CompanyContactPerson { get; set; }
        public string CompanyAddress { get; set; }
        public string VendorName { get; set; }
        public string VendorAddress { get; set; }

        public string? VendorCode { get; set; }
        public string? CurrencySymbol { get; set; }
        public string VendorContactPerson { get; set; }

        public string PurchaseOrderNo { get; set; }
        public DateTime? PurchaseOrderDate { get; set; }        
        public List<PurchaseOrderItemDto> Items { get; set; }

        public decimal? GrandTotal { get; set; }
        public decimal? FreightCharges { get; set; }
        public string TermsConditions { get; set; }
        public string? CustomerNotes { get; set; }
    }

    public class PurchaseOrderItemDtos
    {
        public int SrNo { get; set; }
        public string PartNo { get; set; }
        public string Description { get; set; }
        public decimal Rate { get; set; }
        public decimal Qty { get; set; }
        public decimal Total { get; set; }
        public string? ProductSource { get; set; }
    }

}