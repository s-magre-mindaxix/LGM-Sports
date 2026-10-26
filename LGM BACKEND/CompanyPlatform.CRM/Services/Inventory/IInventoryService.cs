using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO.Inventory.CompanyPlatform.CRM.DTO.Inventory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Inventory
{
    public interface IInventoryService
    {
        Task<List<InventorySummaryDto>> GetFullInventoryAsync(string typeFilter);
        Task<bool> AdjustStockAsync(StockAdjustmentDto dto);
        Task<bool> MoveToScrapAsync(ScrapRequestDto dto);

        Task<List<object>> GetScrapHistoryAsync();
        Task<List<object>> GetTransactionHistoryAsync();

        Task<List<InventoryTransaction>> GetItemTransactionsAsync(int itemId, string itemType);
    }
}
