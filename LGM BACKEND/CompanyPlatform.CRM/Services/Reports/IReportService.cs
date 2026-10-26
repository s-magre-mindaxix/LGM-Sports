using CompanyPlatform.CRM.DTO.Reports;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Reports
{
    public interface IReportService
    {
        //offer report 
        Task<List<OfferReportResultDto>> GetOfferReportAsync(OfferReportDto filter);
        Task<bool> UpdateOfferFinalNoteAsync(UpdateOfferFinalNoteDto dto);

        //orderacceptance report
        Task<List<OrderAcceptanceReportResultDto>> GetOrderAcceptanceReportAsync(OrderAcceptanceReportDto filter);
        Task<bool> UpdateOrderAcceptanceFinalNoteAsync(UpdateOrderAcceptanceFinalNoteDto dto);

        //purchase order report
        Task<List<PurchaseOrderReportResultDto>> GetPurchaseOrderReportAsync(PurchaseOrderReportDto filter);
        Task<bool> UpdatePOFinalNoteAsync(UpdatePOFinalNoteDto dto);

        //proforma invoice report
        Task<List<ProformaInvoiceReportResultDto>> GetProformaInvoiceReportAsync(ProformaInvoiceReportDto filter);
        Task<bool> UpdateProformaInvoiceFinalNoteAsync(UpdateProformaInvoiceFinalNoteDto dto);

        //invoice report
        Task<List<InvoiceReportResultDto>> GetInvoiceReportAsync(InvoiceReportDto filter);
        Task<bool> UpdateInvoiceFinalNoteAsync(UpdateInvoiceFinalNoteDto dto);

    }
}
