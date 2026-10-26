using CompanyPlatform.Core.DTO.DummyInvoice;
using CompanyPlatform.Core.DTO.ProformaInvoice;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.ProformaInvoice
{
    public interface IProformaInvoiceService
    {
        Task<List<SelectOptionDto>> GetActiveOffersAsync();
        Task<ProformaInvoiceViewDto> GetDataFromOfferIdAsync(int offerId);
        Task<int> CreateAsync(ProformaInvoiceDto dto);
        Task<List<ProformaInvoiceListDto>> GetAllAsync();
        Task<ProformaInvoiceDto> GetByIdAsync(int id);
        Task<bool> UpdateAsync(int id, ProformaInvoiceDto dto);
        Task<bool> DeleteAsync(int id);
        Task<ProformaInvoicePdfDto> GetProformaInvoiceForPdfAsync(int proformaInvoiceId);

        Task<DummyInvoiceDto> GetDataForDummyInvoiceAsync(int proformaInvoiceId);

        Task<int> CreateDummyInvoiceAsync(DummyInvoiceDto dto);

        Task<List<DummyInvoiceListDto>> GetAllDummyInvoicesAsync();

        Task<bool> ToggleStatusAsync(int id);

        Task<bool> HasDummyInvoiceAsync(int proformaInvoiceId);

        Task<ProformaInvoicePdfDto?> GetDummyInvoiceForPdfAsync(int dummyInvoiceId);

        Task<List<SelectOptionDto>> GetActiveServiceReportsAsync();

        Task<ProformaInvoiceViewDto> GetDataFromServiceReportAsync(int serviceReportId);

        Task<byte[]> GenerateExcelAsync(int id);
    }
}
