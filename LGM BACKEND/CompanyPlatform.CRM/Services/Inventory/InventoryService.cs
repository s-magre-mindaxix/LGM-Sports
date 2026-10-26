using CompanyPlatform.Core.Data;
using CompanyPlatform.Core.Models.CRM;
using CompanyPlatform.CRM.DTO.Inventory.CompanyPlatform.CRM.DTO.Inventory;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompanyPlatform.CRM.Services.Inventory
{
    public class InventoryService : IInventoryService
    {
        private readonly ApplicationDBContext _context;
        public InventoryService(ApplicationDBContext context) => _context = context;

        public async Task<bool> AdjustStockAsync(StockAdjustmentDto dto)
        {
            int previousStock = 0;
            if (dto.ItemType == "Product")
            {
                var product = await _context.Tbl_Products.FindAsync(dto.ItemId);
                if (product == null) return false;
                previousStock = product.AvailableQuantity;
                product.AvailableQuantity += (dto.Action == "Add" ? dto.Quantity : -dto.Quantity);
            }
            else
            {
                var accessory = await _context.Tbl_Accessories.FindAsync(dto.ItemId);
                if (accessory == null) return false;
                previousStock = accessory.AvailableQuantity;
                accessory.AvailableQuantity += (dto.Action == "Add" ? dto.Quantity : -dto.Quantity);
            }

            _context.Tbl_InventoryTransactions.Add(new InventoryTransaction
            {
                ItemType = dto.ItemType,
                ItemId = dto.ItemId,

                TransactionType = dto.Action == "Add"
                      ? "Manual Stock In"
                      : "Manual Stock Out",

                Quantity = dto.Quantity,

                PreviousStock = previousStock,

                NewStock = previousStock + (dto.Action == "Add"
                  ? dto.Quantity
                  : -dto.Quantity),

                // Tracking (Manual Adjustment)
                ShipmentInitiateId = null,
                ShipmentUnderTransitId = null,
                PurchaseOrderId = null,
                InvoiceId = null,
                DispatchId = null,
                ReferenceNo = "Manual",

                Remarks = dto.Remarks,

                Timestamp = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MoveToScrapAsync(ScrapRequestDto dto)
        {
            // Transaction start karte hain taaki dono table mein data jaye ya kisi mein na jaye
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                int prevStock = 0;

                // 1. Pehle Main Inventory se stock kam karein
                if (dto.ItemType == "Product")
                {
                    var item = await _context.Tbl_Products.FindAsync(dto.ItemId);
                    if (item == null || item.AvailableQuantity < dto.Quantity) return false;

                    prevStock = item.AvailableQuantity;
                    item.AvailableQuantity -= dto.Quantity; // Stock minus hua
                }
                else
                {
                    var item = await _context.Tbl_Accessories.FindAsync(dto.ItemId);
                    if (item == null || item.AvailableQuantity < dto.Quantity) return false;

                    prevStock = item.AvailableQuantity;
                    item.AvailableQuantity -= dto.Quantity; // Stock minus hua
                }

                // 2. Tbl_ScrapItems mein entry karein (Yeh miss ho raha tha)
                var scrapEntry = new ScrapItem
                {
                    ItemType = dto.ItemType,
                    ItemId = dto.ItemId,
                    Quantity = dto.Quantity,
                    Reason = dto.Reason,
                    ScrapDate = DateTime.Now,
                    IsDeleted = false
                };
                _context.Tbl_ScrapItems.Add(scrapEntry);

                // 3. Tbl_InventoryTransactions mein bhi entry karein (Audit log ke liye)
                _context.Tbl_InventoryTransactions.Add(new InventoryTransaction
                {
                    ItemType = dto.ItemType,

                    ItemId = dto.ItemId,

                    TransactionType = "Scrap",

                    Quantity = dto.Quantity,

                    PreviousStock = prevStock,

                    NewStock = prevStock - dto.Quantity,

                    ShipmentInitiateId = null,

                    ShipmentUnderTransitId = null,

                    PurchaseOrderId = null,

                    InvoiceId = null,

                    DispatchId = null,

                    ReferenceNo = "Scrap",

                    Remarks = "Scrapped : " + dto.Reason,

                    Timestamp = DateTime.Now
                });

                // Sab save karein
                await _context.SaveChangesAsync();

                // Database commit karein
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<List<InventorySummaryDto>> GetFullInventoryAsync(string typeFilter)
        {
            var list = new List<InventorySummaryDto>();
            if (typeFilter == "All" || typeFilter == "Product")
            {
                list.AddRange(await _context.Tbl_Products.Where(x => !x.IsDeleted)
                    .Select(p => new InventorySummaryDto { ItemId = p.ProductId, ItemType = "Product", Name = p.ProductName, Code = p.ProductCode, Description = p.ProductDescription, CurrentStock = p.AvailableQuantity, WarningLimit = p.OutOfStockWarning }).ToListAsync());
            }
            if (typeFilter == "All" || typeFilter == "Accessory")
            {
                list.AddRange(await _context.Tbl_Accessories.Where(x => !x.IsDeleted)
                    .Select(a => new InventorySummaryDto { ItemId = a.AccessoriesId, ItemType = "Accessory", Name = a.AccessoriesName, Code = a.AccessoriesCode, Description = a.AccessoriesDescription, CurrentStock = a.AvailableQuantity, WarningLimit = a.OutOfStockWarning }).ToListAsync());
            }
            return list.OrderBy(x => x.Name).ToList();
        }

 
        public async Task<List<object>> GetScrapHistoryAsync()
        {
            var scrapItems = await _context.Tbl_ScrapItems.Where(x => !x.IsDeleted).ToListAsync();
            var result = new List<object>();

            foreach (var s in scrapItems)
            {
                // Join logic happens here in the service
                string itemName = s.ItemType == "Product"
                    ? _context.Tbl_Products.FirstOrDefault(p => p.ProductId == s.ItemId)?.ProductName ?? "Unknown"
                    : _context.Tbl_Accessories.FirstOrDefault(a => a.AccessoriesId == s.ItemId)?.AccessoriesName ?? "Unknown";

                // We return an anonymous object with all fields
                result.Add(new
                {
                    s.Id,
                    s.ItemType,
                    s.ItemId,
                    s.Quantity,
                    s.Reason,
                    s.ScrapDate,
                    ItemName = itemName
                });
            }
            return result;
        }

        public async Task<List<object>> GetTransactionHistoryAsync()
        {
            var transactions = await _context.Tbl_InventoryTransactions.OrderByDescending(t => t.Timestamp).ToListAsync();
            var result = new List<object>();

            foreach (var t in transactions)
            {
                string itemName = t.ItemType == "Product"
                    ? _context.Tbl_Products.IgnoreQueryFilters().FirstOrDefault(p => p.ProductId == t.ItemId)?.ProductName ?? "Deleted Product"
                    : _context.Tbl_Accessories.IgnoreQueryFilters().FirstOrDefault(a => a.AccessoriesId == t.ItemId)?.AccessoriesName ?? "Deleted Accessory";

                string itemCode = t.ItemType == "Product"
                    ? _context.Tbl_Products.IgnoreQueryFilters().FirstOrDefault(p => p.ProductId == t.ItemId)?.ProductCode ?? "-"
                    : _context.Tbl_Accessories.IgnoreQueryFilters().FirstOrDefault(a => a.AccessoriesId == t.ItemId)?.AccessoriesCode ?? "-";

                result.Add(new
                {
                    t.Id,
                    t.ItemType,
                    t.TransactionType,
                    t.Quantity,
                    t.PreviousStock,
                    t.NewStock,
                    t.Remarks,
                    t.Timestamp,
                    t.ShipmentInitiateId,
                    t.ShipmentUnderTransitId,
                    t.PurchaseOrderId,
                    t.InvoiceId,
                    t.DispatchId,
                    t.ReferenceNo,
                    ItemName = itemName,
                    ItemCode = itemCode,
                });
            }
            return result;
        }

        public async Task<List<InventoryTransaction>> GetItemTransactionsAsync(int itemId, string itemType)
        {
            return await _context.Tbl_InventoryTransactions.Where(t => t.ItemId == itemId && t.ItemType == itemType).OrderByDescending(t => t.Timestamp).ToListAsync();
        }

    }
}
