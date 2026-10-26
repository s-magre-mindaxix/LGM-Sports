using CompanyPlatform.Core.Models.HRMS;

namespace PayrollManagementAPI.Services.FullandFinal
{
    public interface IFnFService
    {
        Task<FnFPreviewResponse> CalculatePreview(FnFPreviewRequest req);

        Task<FnFSettlement> Finalize(FnFSettlement settlement);
    }
}
