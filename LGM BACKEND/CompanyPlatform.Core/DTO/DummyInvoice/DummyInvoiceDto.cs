using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.Core.DTO.DummyInvoice
{
    public class DummyInvoiceDto
    {
        public int DummyInvoiceId { get; set; }
        public int OriginalProformaInvoiceId { get; set; }
        public string ProformaInvoiceNo { get; set; } // From original PI
        public DateTime ProformaInvoiceDate { get; set; }
        public DateTime ProformaInvoiceExpiryDate { get; set; }
        public int OrderAcceptanceId { get; set; }

        public int? ServiceReportId { get; set; }
        public int ProductGroupId { get; set; }
        public int CompanyId { get; set; }
        public int? VendorId { get; set; }
        public int CompanyGroupId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public int? ResponsiblePersonId { get; set; }
        public string ResponsiblePersonName { get; set; }
        public int CurrencyId { get; set; }
        public string CurrencySymbol { get; set; }
        public int PlaceOfSupplyId { get; set; }
        public int BankDetailId { get; set; }
        public string CustomerPO { get; set; }
        public DateTime? CustomerPODate { get; set; }
        public string ConsigneeNameAndAddress { get; set; }
        public decimal Subtotal { get; set; }


        public decimal Percentage { get; set; }

        public decimal PercentageAmount { get; set; }

        public decimal PercentageTaxAmount { get; set; }

        public decimal TotalAmount { get; set; }

        public decimal BalanceAmount { get; set; }
        public decimal FreightOrCarrierInsurance { get; set; }
        public decimal TotalGstAmount { get; set; }
        public decimal GrandTotal { get; set; }
        public string TermsAndConditions { get; set; }
        public string CustomerNotes { get; set; }
        public List<DummyInvoiceItemDto> Items { get; set; }
    }

    public class DummyInvoiceItemDto
    {
        public int? ProductId { get; set; } // Can be null

        public int? AccessoryId { get; set; }

        public string? ItemType { get; set; }

        public string? ProductName { get; set; }

        public string? AccessoryName { get; set; }

        public string? ProductImage { get; set; }

        public List<int> AccessoryIds { get; set; } = new();
        public string Description { get; set; }
        public string HsnSacCode { get; set; }
        public int Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Discount { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal Total { get; set; }
        public decimal GstTax { get; set; }
        public decimal Price { get; set; }
        // We don't need accessory-related fields here as it's fully manual
    }

    public class DummyInvoiceListDto
    {
        public int DummyInvoiceId { get; set; }

        public int OriginalProformaInvoiceId { get; set; }
        public string DummyInvoiceNo { get; set; }
        public DateTime CreatedDate { get; set; }

        public string Date { get; set; }
        public string CustomerName { get; set; }
        public decimal GrandTotal { get; set; }

        public decimal TotalAmount { get; set; }
        public string CurrencySymbol { get; set; }
        public string OriginalProformaInvoiceNo { get; set; } // To show which PI it was based on
    }


    public class FinalDummyInvoiceDto
    {
        public int OriginalInvoiceId { get; set; }
        public string OriginalInvoiceNo { get; set; }
        public DateTime FinalDummyInvoiceDate { get; set; }
        public string CustomerPo { get; set; }
        public DateTime? CompanyPoDate { get; set; }
        public string ConsigneeNameAddress { get; set; }
        public decimal SubTotal { get; set; }
        public decimal FreightCharges { get; set; }
        public decimal TotalGstAmount { get; set; }
        public decimal GrandTotal { get; set; }

        public bool AdvanceReceived { get; set; }
        public decimal AdvanceAmount { get; set; }
        public decimal BalanceAmount { get; set; }
        public int ProductGroupId { get; set; }
        public int CompanyId { get; set; }
        public int? VendorId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public int CompanyGroupId { get; set; }
        public int? ResponsiblePersonId { get; set; }
        public string ResponsiblePersonName { get; set; }
        public int CurrencyId { get; set; }
        public string CurrencySymbol { get; set; }
        public int PlaceOfSupplyId { get; set; }
        public int BankDetailId { get; set; }
        public string TermsConditions { get; set; }
        public string CustomerNotes { get; set; }
        public List<FinalDummyInvoiceItemDto> Items { get; set; }
    }

    public class FinalDummyInvoiceItemDto
    {
        public int? ProductId { get; set; }

        public int? AccessoryId { get; set; }

        public string ItemType { get; set; }
        public string Description { get; set; }
        public string HsnSacCode { get; set; }
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Discount { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal Total { get; set; }
        public decimal GstAmount { get; set; }
        public decimal Price { get; set; }
    }

    public class FinalDummyInvoiceListDto
    {
        public int OriginalInvoiceId { get; set; }
        public int FinalDummyInvoiceId { get; set; }
        public string FinalDummyInvoiceNo { get; set; }
        public DateTime FinalDummyInvoiceDate { get; set; }
        public string CustomerName { get; set; }
        public decimal GrandTotal { get; set; }

        public decimal AdvanceAmount { get; set; }
        public decimal BalanceAmount { get; set; }
        public string CurrencySymbol { get; set; }
        public string OriginalInvoiceNo { get; set; }
    }
}
