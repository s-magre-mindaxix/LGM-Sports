using CompanyPlatform.Core.DTO.Enquiry;
using CompanyPlatform.CRM.DTO.PurchaseOrder;

public interface IPurchaseOrderService
{
    Task<List<PurchaseOrderDto>> GetAllAsync();
    Task<PurchaseOrderDto> GetByIdAsync(int id);
    Task<int> CreateAsync(PurchaseOrderDto dto);
    Task<bool> UpdateAsync(PurchaseOrderDto dto);
    Task<bool> DeleteAsync(int id);
    Task<List<SelectOptionDto>> GetFinalOAsAsync();
    Task<List<SelectOptionDto>> GetFinalServiceOAsAsync();
    Task<string> GetNextPONumberAsync();
    Task<PurchaseOrderPdfDto> GetPurchaseOrderPdf(int id);

    Task<PurchaseOrderDto> GetDataForPOFromOAsAsync(List<int> oaIds);
}