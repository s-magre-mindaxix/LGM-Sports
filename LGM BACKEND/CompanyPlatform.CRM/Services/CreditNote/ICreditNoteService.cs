using CompanyPlatform.CRM.DTO.CreditNote;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.CreditNote
{
    public interface ICreditNoteService
    {
        Task<List<InvoiceDropdownDto>> GetInvoiceDropdownAsync();
        Task<List<CreditNoteListDto>> GetAllAsync();

        Task<CreditNoteDto> GetByIdAsync(int creditNoteId);

        Task<CreditNoteDto> GetInvoiceForCreditNoteAsync(int invoiceId);

        Task<int> CreateAsync(CreateCreditNoteDto dto);

        Task<bool> UpdateAsync(int creditNoteId, CreateCreditNoteDto dto);

        Task<bool> DeleteAsync(int creditNoteId);

        Task<byte[]> DownloadExcelAsync(int creditNoteId);

        Task<CreditNoteDto?> GetCreditNotePdfAsync(int creditNoteId);

        Task<string> GetLastCreditNoteNoAsync();
    }
}
