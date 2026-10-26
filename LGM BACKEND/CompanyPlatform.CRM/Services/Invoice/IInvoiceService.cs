using CompanyPlatform.Core.DTO.DummyInvoice;
using CompanyPlatform.CRM.DTO.Invoice;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Invoice
{
    public interface IInvoiceService
    {
        Task<IEnumerable<SelectableOrderAcceptanceDTO>> GetActiveOrderAcceptancesForInvoiceAsync();

        Task<OrderAcceptanceForInvoiceDTO> GetDataFromOrderAcceptanceAsync(int orderAcceptanceId);
        Task<int> SaveInvoiceAsync(SaveInvoiceDTO dto);
        Task<List<InvoiceDTO>> GetAllInvoicesAsync();
        Task<InvoiceDTO> GetInvoiceByIdAsync(int invoiceId);
        Task<int> UpdateInvoiceAsync(SaveInvoiceDTO dto);
        Task<InvoicePdfDto?> GetInvoiceForPdfAsync(int invoiceId);
        Task<bool> DeleteInvoiceAsync(int invoiceId);

        Task<FinalDummyInvoiceDto> GetDataForFinalDummyInvoiceAsync(int invoiceId);
        Task<int> CreateFinalDummyInvoiceAsync(FinalDummyInvoiceDto dto);
        Task<List<FinalDummyInvoiceListDto>> GetAllFinalDummyInvoicesAsync();
        Task<bool> CheckFinalDummyExistsAsync(int invoiceId);
        Task<InvoicePdfDto?> GetDummyInvoiceForPdfAsync(int dummyInvoiceId);

        Task<IEnumerable<SelectableSerialNumberDTO>> GetServiceReportSerialNumbersAsync();

        Task<ServiceReportInvoiceDTO> GetDataFromServiceReportAsync(int serviceReportId);

        Task<IEnumerable<SelectableProformaInvoiceDTO>> GetActiveProformaInvoicesAsync();

        Task<OrderAcceptanceForInvoiceDTO> GetDataFromProformaInvoiceAsync(int proformaInvoiceId);

        Task<byte[]> ExportInvoiceExcelAsync(int invoiceId);

    }
}
