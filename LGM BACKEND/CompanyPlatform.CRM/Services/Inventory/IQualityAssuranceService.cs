using CompanyPlatform.CRM.DTO.Inventory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Inventory
{
    public interface IQualityAssuranceService
    {
        // To show the QA Manager what needs checking
        Task<List<QualityAssuranceDto>> GetPendingItemsAsync();

        // To show what was approved/rejected in the past
        Task<List<QualityAssuranceDto>> GetQAHistoryAsync();

        // The main function to "Accept" and move stock to Inventory
        Task<bool> UpdateQAStatusAsync(QAStatusUpdateDto dto);
    }
}
