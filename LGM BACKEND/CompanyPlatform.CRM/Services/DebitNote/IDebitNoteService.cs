using CompanyPlatform.CRM.DTO.CreditNote;
using CompanyPlatform.CRM.DTO.DebitNote;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.DebitNote
{
    public interface IDebitNoteService
    {
        Task<List<InvoiceDropdownDtos>> GetInvoiceDropdownAsync();

        Task<DebitNoteDto> GetInvoiceForDebitNoteAsync(int invoiceId);

        Task<List<DebitNoteDto>> GetAllAsync();

        Task<DebitNoteDto> GetByIdAsync(int debitNoteId);

        Task<int> CreateAsync(CreateDebitNoteDto dto);

        Task<bool> UpdateAsync(int debitNoteId,CreateDebitNoteDto dto);

        Task<bool> DeleteAsync(int debitNoteId);

        Task<DebitNotePdfDto> GetDebitNotePdfAsync(int debitNoteId);
        Task<byte[]> GetDebitNoteExcelAsync( int debitNoteId);

        Task<string> GetLastDebitNoteNoAsync();
    }
}
